import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscriptionRequest {
  comedian_id: string
  video_path: string
}

interface AssemblyAITranscript {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text: string | null
  words: Array<{
    text: string
    start: number
    end: number
    confidence: number
  }> | null
  error: string | null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { comedian_id, video_path }: TranscriptionRequest = await req.json()

    if (!comedian_id || !video_path) {
      throw new Error('Missing comedian_id or video_path')
    }

    // Update status to processing
    await supabaseClient
      .from('comedians')
      .update({ transcription_status: 'processing' })
      .eq('id', comedian_id)

    // Get AssemblyAI API key
    const assemblyKey = Deno.env.get('ASSEMBLYAI_API_KEY')
    if (!assemblyKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured')
    }

    // Download video from storage
    const { data: videoData, error: downloadError } = await supabaseClient
      .storage
      .from('videos')
      .download(video_path)

    if (downloadError || !videoData) {
      throw new Error(`Failed to download video: ${downloadError?.message}`)
    }

    // Upload video to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': assemblyKey,
        'Content-Type': 'application/octet-stream',
      },
      body: videoData,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`AssemblyAI upload error: ${error}`)
    }

    const { upload_url } = await uploadResponse.json()

    // Create transcription job
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
      }),
    })

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.text()
      throw new Error(`AssemblyAI transcript error: ${error}`)
    }

    const { id: transcriptId } = await transcriptResponse.json()

    // Poll for completion
    let transcript: AssemblyAITranscript
    while (true) {
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': assemblyKey,
        },
      })

      if (!pollResponse.ok) {
        const error = await pollResponse.text()
        throw new Error(`AssemblyAI poll error: ${error}`)
      }

      transcript = await pollResponse.json()

      if (transcript.status === 'completed') {
        break
      } else if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`)
      }

      // Wait 3 seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    // Generate VTT subtitles from words
    let vttContent = 'WEBVTT\n\n'
    if (transcript.words && transcript.words.length > 0) {
      // Group words into subtitle segments (roughly 10 words per segment)
      const wordsPerSegment = 10
      for (let i = 0; i < transcript.words.length; i += wordsPerSegment) {
        const segmentWords = transcript.words.slice(i, i + wordsPerSegment)
        const startTime = formatVttTime(segmentWords[0].start)
        const endTime = formatVttTime(segmentWords[segmentWords.length - 1].end)
        const text = segmentWords.map((w) => w.text).join(' ')

        vttContent += `${Math.floor(i / wordsPerSegment) + 1}\n`
        vttContent += `${startTime} --> ${endTime}\n`
        vttContent += `${text}\n\n`
      }
    }

    // Upload VTT file to storage
    const vttPath = video_path.replace(/\.[^.]+$/, '.vtt')
    const { error: uploadError } = await supabaseClient
      .storage
      .from('videos')
      .upload(vttPath, new Blob([vttContent], { type: 'text/vtt' }), {
        contentType: 'text/vtt',
        upsert: true,
      })

    if (uploadError) {
      console.error('Failed to upload VTT:', uploadError)
    }

    // Get public URL for subtitles
    const { data: { publicUrl: subtitlesUrl } } = supabaseClient
      .storage
      .from('videos')
      .getPublicUrl(vttPath)

    // Update comedian profile with transcription
    const { error: updateError } = await supabaseClient
      .from('comedians')
      .update({
        transcription: transcript.text,
        subtitles_url: subtitlesUrl,
        transcription_status: 'completed',
      })
      .eq('id', comedian_id)

    if (updateError) {
      throw new Error(`Failed to update comedian: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcript.text,
        subtitles_url: subtitlesUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Transcription error:', error)

    // Try to update status to failed
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      const { comedian_id } = await req.clone().json()
      if (comedian_id) {
        await supabaseClient
          .from('comedians')
          .update({ transcription_status: 'failed' })
          .eq('id', comedian_id)
      }
    } catch {}

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function formatVttTime(ms: number): string {
  const totalSeconds = ms / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor(ms % 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
}

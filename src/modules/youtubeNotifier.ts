import { getBotData, updateBotData } from '../core/db/functions'
import { Streamer, streamers } from '../core/db/streamers'
import { log } from '../helpers'
import { emoji } from '../helpers/discord'
import { notifyDiscord, NotifyOptions } from './notify'
import { frameEmitter } from './holodex/frameEmitter'
import { DexFrame } from './holodex/frames'

// frameEmitter.on ('frame', notifyFrame)

async function notifyFrame (frame: DexFrame): Promise<void> {
  const botData    = await getBotData ()
  const streamer   = streamers.find (s => s.ytId === frame.channel.id)
  const isRecorded = botData.notifiedYtLives.includes (frame.id)
  const isNew      = streamer && !isRecorded
  const mustNotify = isNew && frame.status === 'live'

  if (isNew) log (`${frame.status} | ${frame.id} | ${streamer!.name}`)
  
  if (mustNotify) {
    notifyDiscord ({
      feature: 'youtube',
      streamer: streamer as Streamer,
      embedBody: `I am live on YouTube!\nhttps://youtu.be/${frame.id}`,
      emoji: emoji.yt,
    })

    notifyDiscord (getRelayNotifyProps (frame))

    updateBotData ({ notifiedYtLives: [ ...botData.notifiedYtLives, frame.id ]})
  }
}

export function getRelayNotifyProps (frame: DexFrame): NotifyOptions {
  return {
    feature: 'relay',
    streamer: streamers.find (s => s.ytId === frame.channel.id)!,
    embedBody: `
      I will now relay translations from live translators.
      ${frame.title}
      https://youtu.be/${frame.id}
    `,
    emoji: emoji.holo,
    videoId: frame.id
  }
}

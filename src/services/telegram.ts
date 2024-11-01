import { Telegraf } from 'telegraf';

const bot = new Telegraf('7043584366:AAGTogXrxcNBejbvmXhP1EpRl4YhiV8cv4k');

export async function searchTelegram(query: string): Promise<Array<{title: string, url: string}>> {
  try {
    // Search in specified channels
    const channels = ['edmsamplepack', 'patreontv', 'underratedchannelll']; // Add your channel names
    let results = [];

    for (const channel of channels) {
      const messages = await bot.telegram.searchMessages(channel, query);
      results = results.concat(
        messages
          .filter(msg => msg.text && (msg.text.toLowerCase().includes('.vst') || 
                                    msg.text.toLowerCase().includes('.dll') ||
                                    msg.text.toLowerCase().includes('.component')))
          .map(msg => ({
            title: msg.text.split('\n')[0],
            url: `https://t.me/${channel}/${msg.message_id}`
          }))
      );
    }

    return results;
  } catch (error) {
    console.error('Telegram search error:', error);
    return [];
  }
}
import axios from 'axios';
import * as cheerio from 'cheerio';

interface RutrackerResult {
  title: string;
  url: string;
  size: string;
  seeders: number;
}

export async function searchRutracker(query: string): Promise<RutrackerResult[]> {
  try {
    // Login to Rutracker
    const loginData = new URLSearchParams({
      login_username: 'Despiru',
      login_password: 'RWSEI',
      login: 'Login'
    });

    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Login
    await axiosInstance.post('https://rutracker.org/forum/login.php', loginData);

    // Search
    const searchUrl = `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(query)}`;
    const response = await axiosInstance.get(searchUrl);
    const $ = cheerio.load(response.data);

    const results: RutrackerResult[] = [];

    $('.torTopic').each((_, element) => {
      const title = $(element).text().trim();
      const url = 'https://rutracker.org/forum/' + $(element).attr('href');
      const size = $(element).closest('tr').find('.tor-size').text().trim();
      const seeders = parseInt($(element).closest('tr').find('.seedmed').text().trim(), 10);

      if (title.toLowerCase().includes('vst') || 
          title.toLowerCase().includes('plugin') ||
          title.toLowerCase().includes('audio')) {
        results.push({ title, url, size, seeders });
      }
    });

    return results;
  } catch (error) {
    console.error('Rutracker search error:', error);
    return [];
  }
}
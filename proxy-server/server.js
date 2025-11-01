import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import puppeteer from "puppeteer"; 
import * as zlib from "zlib";
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const cache=new Map() ;
const CACHE_TTL= 365*24*60*60*1000 ;// max caching till 1 year 

app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});
app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.6139&lng=77.2090&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING",
    
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Swiggy API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy server error:", err.message);
    res.status(500).json({ error: "Failed to fetch data from Swiggy" });
  }
});

// ✅ New search route
app.get("/api/restaurants/search", async (req, res) => {
  const { q } = req.query; // search text
  try {
    const response = await fetch(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.6139&lng=77.2090&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING"
    );

    const data = await response.json();

    // Extract restaurant list
    const list =
      data?.data?.cards
        ?.find((c) => c.cardType === "seeAllRestaurants")
        ?.data?.data?.restaurants || [];

    // Filter locally by name
    const filtered = list.filter((r) =>
      r.info.name.toLowerCase().includes(q.toLowerCase())
    );

    res.json(filtered);
  } catch (error) {
    console.error("Search API error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});



app.get("/", (_req, res) => {
  res.send("Backend is up ✅ — use /api/restaurants/:resID");
});

// app.get("/api/restaurants/:resID", async (req, res) => {
//   const { resID } = req.params;
//   console.log("Received request for restaurant ID:", resID);

//   const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=28.6139&lng=77.2090&restaurantId=${resID}&submitAction=ENTER`;

//   try {
//     console.log("Fetching Swiggy data:", url);

//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "authority": "www.swiggy.com",
//         "accept": "application/json, text/plain, */*",
//         "accept-language": "en-US,en;q=0.9",
//         "cache-control": "no-cache",
//         "referer": "https://www.swiggy.com/",
//         "origin": "https://www.swiggy.com",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "user-agent":
//           "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
//         "sec-ch-ua":
//           '"Chromium";v="140", "Google Chrome";v="140", "Not-A.Brand";v="99"',
//         "sec-ch-ua-platform": '"macOS"',
//         // ✅ Copy this from your actual Chrome request (Network tab → Request Headers → Cookie)
//         "cookie":
//          "__SW=scc0AbBdKVnkN_NivIGRd8srIdn6zevg; _device_id=75f2ea2a-03fe-3e4e-da7d-4a8d71ee79a1; userLocation={%22lat%22:%2228.65420%22%2C%22lng%22:%2277.23730%22%2C%22address%22:%22%22%2C%22area%22:%22%22%2C%22showUserDefaultAddressHint%22:false}; fontsLoaded=1; _gcl_au=1.1.158911941.1759832263; _ga=GA1.2.1328633499.1759832264; _ga_YE38MFJRBZ=GS2.1.s1760350158$o2$g0$t1760350158$j60$l0$h0; _ga_34JYJ0BCRN=GS2.1.s1760350158$o2$g0$t1760350158$j60$l0$h0; _guest_tid=e1aa209b-69c7-44ee-bbe3-06d679693767; _is_logged_in=; aws-waf-token=56c93852-8efc-463a-baf1-b8550db04af4:BQoAmvcw5as9AAAA:KhIf0bJge6TRMnyCy1AeshKWm4BRqWSPGjIoJiBnSQ7HgY7rvaFaE7hLazD+htBJd4ioawkaKI0JwK01W4golR51YYicNS7g/aDziC4WHGelgVdyRG2wvlgkUEbnCly3lVVjOlRFbHbg+SwLwBxL8EnQyKlD9DG8rzDeiyR7J0bjG5W0xGhn2w/z4FFTMJBQqR19w1yknhQUag6Ty6I4M3q+fTc/ONgVKinLkGyBcRK7P2zr0+YI",
//         "accept-encoding": "gzip, deflate, br"
//       },
//     });

//     console.log("Swiggy response status:", response.status);
//     const encoding = response.headers.get("content-encoding");

//     // Handle compressed response
//     const buffer = await response.arrayBuffer();
//     let text;
//     if (encoding === "gzip") {
//       text = zlib.gunzipSync(Buffer.from(buffer)).toString("utf8");
//     } else if (encoding === "br") {
//       text = zlib.brotliDecompressSync(Buffer.from(buffer)).toString("utf8");
//     } else {
//       text = Buffer.from(buffer).toString("utf8");
//     }
    
//      if (response.status === 202 && attempt === 5) {
//   console.log("⚙️ Falling back to Puppeteer...");
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "networkidle2" });
//   const html = await page.content();
//   const jsonText = html.match(/\{[\s\S]*?\}/);
//   if (jsonText) {
//     const data = JSON.parse(jsonText[0]);
//     await browser.close();
//     return res.json(data);
//   }
//   await browser.close();
// }

//     if (!response.ok || !text.trim()) {
//       console.error("Invalid or empty response from Swiggy:", response.status);
//       return res
//         .status(502)
//         .json({ error: "Swiggy returned invalid response", status: response.status });
//     }

//     const data = JSON.parse(text);
//     res.json(data);
//   } catch (err) {
//     console.error("Error fetching Restaurant Menu:", err);
//     res.status(500).json({ error: "Failed to fetch restaurant data" });
//   }
// });

// ...existing code...
app.get("/api/restaurants/:resID", async (req, res) => {
  const { resID } = req.params;
  console.log("Received request for restaurant ID:", resID);

  const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=28.6139&lng=77.2090&restaurantId=${resID}&submitAction=ENTER`;

  try {
    console.log("Fetching Swiggy data:", url);

    const maxAttempts = 5;
    let lastResponse = null;
    let lastText = "";
    let lastStatus = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Attempt ${attempt} fetching ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "authority": "www.swiggy.com",
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "referer": "https://www.swiggy.com/",
          "origin": "https://www.swiggy.com",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          "sec-ch-ua":
            '"Chromium";v="140", "Google Chrome";v="140", "Not-A.Brand";v="99"',
          "sec-ch-ua-platform": '"macOS"',
          "cookie": "__SW=...; aws-waf-token=...;",
          "accept-encoding": "gzip, deflate, br"
        },
      });

      lastResponse = response;
      lastStatus = response.status;
      console.log("Swiggy response status:", response.status);

      // Read buffer and decode if compressed
      const encoding = response.headers.get("content-encoding");
      const buffer = await response.arrayBuffer();
      if (encoding === "gzip") {
        lastText = zlib.gunzipSync(Buffer.from(buffer)).toString("utf8");
      } else if (encoding === "br") {
        lastText = zlib.brotliDecompressSync(Buffer.from(buffer)).toString("utf8");
      } else {
        lastText = Buffer.from(buffer).toString("utf8");
      }

      // If valid JSON body returned, break and parse
      if (response.ok && lastText && lastText.trim()) {
        break;
      }

      // If server returned 202 (accepted / processing), wait and retry
      if (response.status === 202 && attempt < maxAttempts) {
        const backoff = 500 * attempt; // simple backoff
        console.log(`Received 202: retrying after ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // otherwise break to decide fallback / error
      break;
    }

    // If we exhausted attempts and last status was 202, fall back to Puppeteer
    if (lastStatus === 202) {
      console.log("⚙️ Falling back to Puppeteer...");
      const browser = await puppeteer.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        const html = await page.content();
        const jsonMatch = html.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          await browser.close();
          return res.json(data);
        } else {
          await browser.close();
          return res.status(502).json({ error: "Puppeteer fallback failed to extract JSON" });
        }
      } catch (pupeErr) {
        await browser.close();
        console.error("Puppeteer error:", pupeErr);
        return res.status(502).json({ error: "Puppeteer fallback failed" });
      }
    }

    if (!lastResponse || !lastResponse.ok || !lastText.trim()) {
      console.error("Invalid or empty response from Swiggy:", lastStatus);
      return res
        .status(502)
        .json({ error: "Swiggy returned invalid response", status: lastStatus });
    }

    const data = JSON.parse(lastText);
    res.json(data);
  } catch (err) {
    console.error("Error fetching Restaurant Menu:", err);
    res.status(500).json({ error: "Failed to fetch restaurant data" });
  }
});
// ...existing code...

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
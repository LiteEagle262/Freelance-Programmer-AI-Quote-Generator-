# Freelance-Programmer-AI-Quote-Generator-

I built this little tool as a side project since I don’t have a full project portfolio yet — just a few personal sites I own. I still take on commissions for fun, though, so I figured this could be a useful tool to show off and help out.

It runs on **FastAPI**, uses **`limits`** for basic rate limiting, and is served through **Cloudflare** to help cut down on spam and abuse.

That said, no one can really burn much money with it anyway — it’s just running on the **free tier of Gemini 1.5 Flash** 💀

### Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
````

2. Edit the system prompt:

   * Modify `system_prompt.txt` to suit your needs.

3. Update contact info on the site.

4. Run the server:

   ```bash
   python server.py
   ```

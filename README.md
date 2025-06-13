# Freelance-Programmer-AI-Quote-Generator-

I built this tool as a small side project since I don’t have a full project portfolio yet — just a few personal websites I own. I still take on commissions for fun, so I figured this could be a useful and fun tool to showcase my skills and help others out.

It runs on **FastAPI**, uses **`limits`** for basic rate limiting, and is served through **Cloudflare** to help mitigate spam and abuse.

That said, no one can really burn much money with it anyway — it’s just running on the **free tier of Gemini 1.5 Flash** 💀

---

### 🚀 Setup

1. **Install dependencies:**

   ```
   pip install -r requirements.txt
   ```

2. **Edit the system prompt:**

   * Modify the contents of `system_prompt.txt` as needed.

3. **Update contact information** on the site (e.g., footer, contact section).

4. **Run the server:**

   ```
   python server.py
   ```

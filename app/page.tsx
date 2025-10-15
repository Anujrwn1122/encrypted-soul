"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EncryptedCanvas from "@/components/EncryptedCanvas";

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;

export default function Home() {
  const [text, setText] = useState("Privacy is power.");
  const [userHandle, setUserHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const u = url.searchParams.get("u");
    const t = url.searchParams.get("t");
    if (u) setUserHandle(u.startsWith("@") ? u : `@${u}`);
    if (t) setText(t);
  }, []);

  const caption = useMemo(
    () =>
      `Just encrypted my thoughts with EncryptedSoul.art 🔒\n` +
      `${text}\n\n` +
      `Encrypted Thought of ${userHandle || "@yourhandle"}\n` +
      `Created by @OxAnuj | #ZamaCreatorProgram`,
    [text, userHandle]
  );

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "encrypted-soul.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      alert("Caption copied!");
    } catch {
      alert("Could not copy. Please copy manually.");
    }
  };

  const shareOnX = () => {
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", caption);
    window.open(intent.toString(), "_blank");
  };

  return (
    <main className="min-h-screen px-5 sm:px-8 py-10">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-zama-yellow flex items-center justify-center text-black font-extrabold tracking-widest">Z</div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            EncryptedSoul.art
          </h1>
          </div>
          <div className="text-xs sm:text-sm opacity-75">
            Powered by Zama • Created by <span className="font-medium">@OxAnuj</span>
          </div>
      </header>

      <section className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div className="card rounded-2xl p-4 shadow-glow">
          <EncryptedCanvas
            ref={canvasRef}
            width={DEFAULT_WIDTH}
            height={DEFAULT_HEIGHT}
            text={text}
            userHandle={userHandle || "@yourhandle"}
            signature="@OxAnuj"
            watermark="EncryptedSoul.art"
            footnote="Inspired by Zama FHE"
            onStart={() => setBusy(true)}
            onDone={() => setBusy(false)}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={download}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Download PNG
            </button>
            <button
              onClick={copyCaption}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Copy Caption
            </button>
            <button
              onClick={shareOnX}
              className="px-4 py-2 rounded-xl bg-zama-yellow text-black font-medium hover:opacity-90 text-sm"
            >
              Post on X
            </button>
            {busy && <span className="text-xs opacity-70">Rendering…</span>}
          </div>
        </div>

        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Create your encrypted art</h2>
          <label className="block text-sm mb-2 opacity-80">Your thought</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to encrypt…"
            rows={6}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-zama-yellow/70"
          />
          <div className="mt-4">
            <label className="block text-sm mb-2 opacity-80">Your X/Twitter handle</label>
            <input
              value={userHandle}
              onChange={(e) => {
                const v = e.target.value.trim();
                setUserHandle(v ? (v.startswith("@") ? v : "@"+v) : "");
              }}
              placeholder="@yourhandle"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-zama-yellow/70"
            />
            <p className="text-xs opacity-60 mt-2">
              Tip: You can also prefill via URL, e.g. <code>?u=OxAnuj&t=Privacy%20is%20power</code>
            </p>
          </div>
          <div className="mt-6 text-xs opacity-70 leading-relaxed">
            • “Created by <strong>@OxAnuj</strong>” stays bottom-right (professional placement).<br/>
            • No server or paid APIs—renders fully in-browser.<br/>
            • Free to host on Vercel.
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto mt-10 opacity-60 text-xs">
        © {new Date().getFullYear()} EncryptedSoul.art • All rights reserved.
      </footer>
    </main>
  );
}

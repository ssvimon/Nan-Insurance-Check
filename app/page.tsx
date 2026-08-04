"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BasicInfo = {
  name: string;
  age: string;
  income: string;
  status: string;
  benefit: string;
  phone: string;
  lineId: string;
  note: string;
};

type Concern = {
  id: string;
  icon: string;
  short: string;
  text: string;
  insight: string;
  action: string;
};

const concerns: Concern[] = [
  { id: "health", icon: "✚", short: "สุขภาพ", text: "ค่ารักษาเพียงพอ โดยไม่กระทบเงินเก็บ", insight: "เช็กช่องว่างของสวัสดิการเดิม เทียบกับรูปแบบโรงพยาบาลที่อยากใช้", action: "รวบรวมสวัสดิการและกรมธรรม์เดิม เพื่อดูวงเงินที่ยังขาด" },
  { id: "critical", icon: "♡", short: "โรคร้ายแรง", text: "มีเงินก้อนรับมือ หากต้องพักงานเพื่อรักษาตัว", insight: "ค่ารักษาเป็นเพียงส่วนหนึ่ง อีกส่วนคือรายได้ที่อาจหยุดลงระหว่างพักฟื้น", action: "ประเมินค่าใช้จ่ายประจำและระยะเวลาที่อยากมีเงินสำรอง" },
  { id: "family", icon: "⌂", short: "ครอบครัว", text: "ครอบครัวไปต่อได้ หากวันหนึ่งรายได้เราหายไป", insight: "ความคุ้มครองควรสัมพันธ์กับภาระหนี้และคนที่พึ่งพารายได้ของเรา", action: "ลิสต์ภาระที่ยังต้องดูแล และเงินสำรองที่ครอบครัวมีอยู่" },
  { id: "retirement", icon: "♧", short: "เกษียณ", text: "มีเงินใช้หลังเกษียณ โดยไม่เป็นภาระใคร", insight: "เริ่มจากภาพชีวิตที่อยากได้ แล้วค่อยย้อนกลับมาหาเงินที่ควรเตรียม", action: "กำหนดอายุเกษียณและค่าใช้จ่ายต่อเดือนที่อยากมี" },
  { id: "saving", icon: "฿", short: "เงินออม", text: "เก็บเงินได้สม่ำเสมอ และเห็นเป้าหมายชัดขึ้น", insight: "แยกเงินตามเป้าหมายช่วยให้ไม่ดึงเงินระยะยาวมาใช้กับเรื่องระยะสั้น", action: "เลือกหนึ่งเป้าหมาย พร้อมจำนวนเงินและวันที่อยากทำให้สำเร็จ" },
  { id: "tax", icon: "%", short: "ภาษี", text: "วางแผนลดหย่อนภาษีให้เหมาะกับรายได้", insight: "ควรวางแผนจากฐานภาษีจริงและเป้าหมายการเงิน ไม่ใช่ซื้อเพื่อลดหย่อนอย่างเดียว", action: "เตรียมรายได้ทั้งปีและรายการลดหย่อนที่มีอยู่แล้ว" },
  { id: "accident", icon: "✦", short: "อุบัติเหตุ", text: "มีตัวช่วยเมื่อเกิดอุบัติเหตุแบบไม่คาดคิด", insight: "ดูทั้งค่ารักษา รายได้ระหว่างพักงาน และผลกระทบระยะยาว", action: "ทบทวนลักษณะงาน การเดินทาง และสวัสดิการอุบัติเหตุเดิม" },
  { id: "invest", icon: "↗", short: "ลงทุน", text: "เริ่มลงทุนระยะยาวอย่างมีแผน", insight: "ก่อนลงทุนควรแยกเงินฉุกเฉินและเงินที่ต้องใช้ในระยะใกล้ออกก่อน", action: "กำหนดระยะเวลา เป้าหมาย และระดับความผันผวนที่รับได้" },
  { id: "child", icon: "☆", short: "อนาคตลูก", text: "เตรียมค่าเรียนและอนาคตให้ลูกอย่างเป็นระบบ", insight: "เป้าหมายที่มีวันใช้เงินชัด ควรแยกจากเงินเกษียณและเงินสำรอง", action: "กำหนดปีที่จะใช้เงินและงบการศึกษาที่ครอบครัวตั้งใจไว้" },
];

const initialInfo: BasicInfo = { name: "", age: "", income: "", status: "", benefit: "", phone: "", lineId: "", note: "" };
const budgetOptions = ["ไม่เกิน 1,000 บาท/เดือน", "1,001–2,000 บาท/เดือน", "2,001–3,500 บาท/เดือน", "3,501–5,000 บาท/เดือน", "มากกว่า 5,000 บาท/เดือน", "ขอคุยเพื่อกำหนดงบก่อน"];
const faqs = [
  { q: "ใช้เวลานานไหม?", a: "ประมาณ 3 นาทีเท่านั้น ตอบคำถามสั้น ๆ แล้วดูสรุปได้ทันที" },
  { q: "ต้องซื้อประกันไหม?", a: "ไม่จำเป็นค่ะ เป็นแบบประเมินเบื้องต้น ไม่มีการบังคับซื้อหรือผูกมัด" },
  { q: "ข้อมูลของฉันไปไหน?", a: "ใช้เพื่อวิเคราะห์เบื้องต้นและให้แนนติดต่อกลับตามช่องทางที่คุณให้ไว้เท่านั้น" },
  { q: "คุยแล้วมีค่าใช้จ่ายไหม?", a: "การคุยเบื้องต้นไม่มีค่าใช้จ่าย คุณเลือกว่าจะดำเนินการต่อหรือไม่ก็ได้" },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<BasicInfo>(initialInfo);
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const formRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (step > 0) window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [step]);

  const updateInfo = (key: keyof BasicInfo, value: string) => {
    setInfo((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const chooseConcern = (id: string) => {
    setError("");
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length === 3) return current;
      return [...current, id];
    });
  };

  const goToNeeds = () => {
    const age = Number(info.age);
    const phone = info.phone.replace(/\D/g, "");
    const lineId = info.lineId.trim();

    if (!info.name.trim() || !info.age || !info.income || !info.status || !info.benefit) {
      setError("กรอกข้อมูลให้ครบก่อนนะคะ จะได้วิเคราะห์ให้ตรงกับคุณมากขึ้น");
      return;
    }
    if (!Number.isFinite(age) || age < 18 || age > 80) {
      setError("แบบประเมินนี้รองรับช่วงอายุ 18–80 ปีค่ะ");
      return;
    }
    if (!phone && !lineId) {
      setError("กรอกเบอร์โทรหรือ LINE ID อย่างน้อย 1 ช่อง เพื่อให้แนนติดต่อกลับได้นะคะ");
      return;
    }
    if (phone && !/^0\d{8,9}$/.test(phone)) {
      setError("เบอร์โทรควรเป็นตัวเลข 9–10 หลัก และขึ้นต้นด้วย 0 ค่ะ");
      return;
    }
    if (!consent) {
      setError("กรุณายอมรับให้แนนติดต่อกลับทางโทรหรือ LINE ก่อนนะคะ");
      return;
    }
    setError("");
    setStep(2);
  };

  const showResult = () => {
    if (selected.length !== 3 || !budget) {
      setError(selected.length !== 3 ? "เลือกให้ครบ 3 เรื่อง แล้วแตะตามลำดับความสำคัญนะคะ" : "เลือกงบประมาณที่สบายใจก่อนนะคะ");
      return;
    }
    setError("");
    setStep(3);

    const priorities = selected
      .map((id) => concerns.find((item) => item.id === id)?.text)
      .filter(Boolean) as string[];

    void fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: info.name,
        age: info.age,
        income: info.income,
        status: info.status,
        benefit: info.benefit,
        phone: info.phone,
        lineId: info.lineId,
        note: info.note,
        budget,
        priorities,
      }),
    }).catch(() => {
      // ไม่บล็อกการดูผล ถ้าส่ง Discord ไม่สำเร็จ
    });
  };

  const selectedConcerns = useMemo(() => selected.map((id) => concerns.find((item) => item.id === id)).filter(Boolean) as Concern[], [selected]);
  const healthNote = info.benefit === "ไม่มี"
    ? "ตอนนี้ยังไม่มีสวัสดิการค่ารักษา จึงควรให้ความสำคัญกับเงินสำรองฉุกเฉินและค่ารักษาพื้นฐานก่อน"
    : `คุณมี${info.benefit}อยู่แล้ว ขั้นต่อไปคือดูว่าเพียงพอกับโรงพยาบาลและรูปแบบการรักษาที่ต้องการหรือไม่`;

  const summaryText = `สวัสดีค่ะแนน ขอส่งผลแบบประเมินให้ช่วยดูต่อค่ะ\n\nสรุปแบบประเมินของ ${info.name}\nอายุ ${info.age} ปี · ${info.status}\nรายได้ ${info.income}/เดือน\nสวัสดิการ: ${info.benefit}\nเบอร์โทร: ${info.phone || "-"}\nLINE ID: ${info.lineId || "-"}\nหมายเหตุ: ${info.note.trim() || "-"}\n\nลำดับความสำคัญ\n1) ${selectedConcerns[0]?.text}\n2) ${selectedConcerns[1]?.text}\n3) ${selectedConcerns[2]?.text}\n\nงบที่สบายใจ: ${budget}`;

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = summaryText;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  };

  const copySummary = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summaryText);
        success = true;
      }
    } catch {
      success = false;
    }
    if (!success) success = fallbackCopy();
    setCopyState(success ? "copied" : "manual");
  };

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="กลับไปด้านบน">
          <span className="brand-mark">น</span>
          <span><strong>คุยเรื่องประกันกับแนน</strong><small>แบบประเมินความคุ้มครองเบื้องต้น</small></span>
        </a>
        <a className="line-link" href="https://line.me/ti/p/~nan.insure" target="_blank" rel="noreferrer">ทัก LINE</a>
      </header>

      <section className={`hero ${step > 0 ? "hero-compact" : ""}`} id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> ใช้เวลาประมาณ 3 นาที</p>
          <h1>ตอนนี้…เรื่องเงินด้านไหน<br /><em>ควรดูแลก่อน?</em></h1>
          <p className="hero-lead">ตอบคำถามสั้น ๆ แล้วรับสรุป “สิ่งที่ควรเริ่มก่อน–หลัง” ตามช่วงชีวิต สวัสดิการ และงบของคุณ</p>
          <div className="trust-row" aria-label="จุดเด่นของแบบประเมิน"><span>✓ ไม่มีค่าใช้จ่าย</span><span>✓ ไม่ฟันธงขายแผน</span><span>✓ ดูผลได้ทันที</span></div>
          {step === 0 && <button className="primary-button hero-button" onClick={() => setStep(1)}>เริ่มเช็กแผนของฉัน <span aria-hidden="true">→</span></button>}
        </div>

        <aside className="insight-card" aria-hidden="true">
          <div className="insight-top"><span className="mini-avatar">N</span><span>ภาพรวมของคุณ</span><b>เบื้องต้น</b></div>
          <div className="ring"><span>3</span><small>เรื่องที่สำคัญ</small></div>
          <div className="mini-bars"><i style={{ width: "92%" }} /><i style={{ width: "70%" }} /><i style={{ width: "48%" }} /></div>
          <p>เราเรียงลำดับให้เห็นง่าย เพื่อเริ่มจากเรื่องสำคัญโดยไม่ทำเกินงบ</p>
        </aside>
      </section>

      {step > 0 && (
        <section className="form-wrap" ref={formRef} aria-live="polite">
          <div className="progress-head">
            <div><p>แบบประเมินของคุณ</p><strong>ขั้นตอนที่ {step} จาก 3</strong></div>
            <span>{step === 1 ? "ข้อมูลพื้นฐาน" : step === 2 ? "จัดลำดับความสำคัญ" : "คำแนะนำของคุณ"}</span>
          </div>
          <div className="progress-track"><i style={{ width: `${step * 33.333}%` }} /></div>

          {step === 1 && (
            <div className="form-card">
              <div className="form-title"><span>01</span><div><h2>เริ่มจากทำความรู้จักคุณนิดนึง</h2><p>กรอกช่องติดต่อกลับไว้ แนนจะได้ทักหาคุณต่อได้เลย</p></div></div>
              <div className="field-grid">
                <label className="field field-wide"><span>ชื่อเล่น <b>*</b></span><input value={info.name} onChange={(e) => updateInfo("name", e.target.value)} placeholder="เช่น แนน" autoComplete="nickname" /></label>
                <label className="field"><span>อายุ <b>*</b></span><input value={info.age} onChange={(e) => updateInfo("age", e.target.value.replace(/\D/g, ""))} placeholder="เช่น 30" inputMode="numeric" /></label>
                <label className="field"><span>รายได้ต่อเดือน <b>*</b></span><select value={info.income} onChange={(e) => updateInfo("income", e.target.value)}><option value="">เลือกช่วงรายได้</option><option>ต่ำกว่า 15,000 บาท</option><option>15,000–30,000 บาท</option><option>30,001–50,000 บาท</option><option>50,001–100,000 บาท</option><option>มากกว่า 100,000 บาท</option></select></label>
                <label className="field"><span>เบอร์โทร <b>*</b></span><input value={info.phone} onChange={(e) => updateInfo("phone", e.target.value.replace(/[^\d\s-]/g, ""))} placeholder="เช่น 0812345678" inputMode="tel" autoComplete="tel" /><small className="field-hint">หรือกรอก LINE ID ด้านขวาก็ได้</small></label>
                <label className="field"><span>LINE ID <b>*</b></span><input value={info.lineId} onChange={(e) => updateInfo("lineId", e.target.value.trimStart())} placeholder="เช่น nan.insure" autoComplete="username" /><small className="field-hint">กรอกอย่างน้อย 1 ช่องระหว่างเบอร์/LINE</small></label>
                <fieldset className="choice-group field-wide"><legend>สถานภาพ <b>*</b></legend><div className="choice-row">{["โสด", "มีคู่", "มีครอบครัว"].map((item) => <button key={item} type="button" className={info.status === item ? "selected" : ""} aria-pressed={info.status === item} onClick={() => updateInfo("status", item)}>{item}</button>)}</div></fieldset>
                <fieldset className="choice-group field-wide"><legend>สวัสดิการค่ารักษาที่มีอยู่ <b>*</b></legend><div className="choice-row benefits">{["ไม่มี", "ประกันสังคม", "ประกันกลุ่ม", "ข้าราชการ", "มีประกันส่วนตัว"].map((item) => <button key={item} type="button" className={info.benefit === item ? "selected" : ""} aria-pressed={info.benefit === item} onClick={() => updateInfo("benefit", item)}>{item}</button>)}</div></fieldset>
                <label className="field field-wide">
                  <span>หมายเหตุถึงแนน</span>
                  <textarea
                    value={info.note}
                    onChange={(e) => updateInfo("note", e.target.value.slice(0, 300))}
                    placeholder="เช่น อยากคุยช่วงเย็น / มีข้อสงสัยเรื่องประกันสุขภาพ"
                    rows={3}
                    maxLength={300}
                  />
                  <small className="field-hint">ไม่บังคับ · เหลือได้อีก {300 - info.note.length} ตัวอักษร</small>
                </label>
                <label className="consent-box field-wide">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setError("");
                    }}
                  />
                  <span>ยินยอมให้แนนติดต่อกลับทางโทรศัพท์หรือ LINE ตามข้อมูลที่ให้ไว้ เพื่อพูดคุยเรื่องแบบประเมินนี้ <b>*</b></span>
                </label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions"><button className="text-button" type="button" onClick={() => setStep(0)}>← ย้อนกลับ</button><button className="primary-button" type="button" onClick={goToNeeds}>ถัดไป <span>→</span></button></div>
            </div>
          )}

          {step === 2 && (
            <div className="form-card needs-card">
              <div className="form-title"><span>02</span><div><h2>อยากให้ชีวิตสบายใจเรื่องไหนบ้าง?</h2><p>เลือก 3 เรื่องตามลำดับความสำคัญ ตอนนี้เลือกแล้ว {selected.length}/3</p></div></div>
              <div className="needs-grid">
                {concerns.map((item) => {
                  const rank = selected.indexOf(item.id);
                  return <button key={item.id} type="button" className={`need-option ${rank >= 0 ? "selected" : ""}`} aria-pressed={rank >= 0} onClick={() => chooseConcern(item.id)}><span className="need-icon">{item.icon}</span><span>{item.text}</span>{rank >= 0 && <b>{rank + 1}</b>}</button>;
                })}
              </div>
              {selected.length === 3 && <div className="priority-summary"><span>ลำดับของคุณ</span>{selectedConcerns.map((item, index) => <i key={item.id}><b>{index + 1}</b>{item.short}</i>)}</div>}
              <label className="field budget-field"><span>งบประมาณที่สบายใจต่อเดือน <b>*</b></span><select value={budget} onChange={(e) => { setBudget(e.target.value); setError(""); }}><option value="">เลือกงบประมาณ</option>{budgetOptions.map((item) => <option key={item}>{item}</option>)}</select><small>เลือกจากจำนวนที่จ่ายต่อเนื่องได้ โดยไม่กระทบค่าใช้จ่ายจำเป็น</small></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions"><button className="text-button" type="button" onClick={() => { setError(""); setStep(1); }}>← ย้อนกลับ</button><button className="primary-button" type="button" onClick={showResult}>ดูคำแนะนำของฉัน <span>→</span></button></div>
            </div>
          )}

          {step === 3 && (
            <div className="result-stack">
              <div className="result-hero">
                <p>สรุปเฉพาะคุณ {info.name}</p>
                <h2>เริ่มจาก <em>{selectedConcerns[0]?.short}</em><br />แล้วค่อยเติมให้ครบภาพรวม</h2>
                <div className="profile-chips"><span>อายุ {info.age} ปี</span><span>{info.status}</span><span>{info.benefit}</span><span>{budget}</span>{info.phone && <span>โทร {info.phone}</span>}{info.lineId && <span>LINE {info.lineId}</span>}</div>
              </div>

              <div className="result-card result-intro"><span className="result-icon">i</span><div><h3>สิ่งที่ควรรู้จากข้อมูลของคุณ</h3><p>{healthNote}</p></div></div>

              <div className="recommendations">
                {selectedConcerns.map((item, index) => (
                  <article className="recommendation" key={item.id}>
                    <div className="rec-rank"><span>{index + 1}</span><small>{index === 0 ? "เริ่มก่อน" : index === 1 ? "ลำดับถัดไป" : "เติมภาพรวม"}</small></div>
                    <div className="rec-body"><p className="rec-label">{item.icon} {item.short}</p><h3>{item.text}</h3><p>{item.insight}</p><div className="next-action"><b>สิ่งที่ทำต่อได้เลย</b><span>{item.action}</span></div></div>
                  </article>
                ))}
              </div>

              <div className="allocation-card">
                <div><p>กรอบจัดลำดับตามงบ</p><h3>ให้น้ำหนักเรื่องสำคัญก่อน</h3><span>เป็นกรอบสำหรับคุยต่อ ไม่ใช่สัดส่วนเบี้ยที่ตายตัว</span></div>
                <div className="allocation-bars"><i><b style={{ width: "50%" }} /><span>อันดับ 1 · 50%</span></i><i><b style={{ width: "30%" }} /><span>อันดับ 2 · 30%</span></i><i><b style={{ width: "20%" }} /><span>อันดับ 3 · 20%</span></i></div>
              </div>

              <div className="cta-card">
                <p className="eyebrow"><span /> ขั้นตอนต่อไป</p>
                <h2>อยากรู้ว่าความคุ้มครองที่มีอยู่<br />พอดีกับงบหรือยัง?</h2>
                <p>คัดลอกข้อความสรุปด้านล่างก่อน แล้วค่อยกดเปิด LINE เพื่อวางข้อความส่งให้แนนค่ะ</p>

                <div className="message-copy-card">
                  <label htmlFor="result-summary">ข้อความสำหรับส่งให้แนน</label>
                  <textarea id="result-summary" readOnly value={summaryText} onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} />
                  <button className="copy-message-button" type="button" onClick={copySummary}>{copyState === "copied" ? "คัดลอกแล้ว ✓" : "คัดลอกข้อความ"}</button>
                  {copyState === "copied" && <p className="copy-status success" role="status">คัดลอกเรียบร้อยแล้วค่ะ กด “เปิด LINE” ต่อได้เลย</p>}
                  {copyState === "manual" && <p className="copy-status warning" role="status">หากคัดลอกอัตโนมัติไม่ได้ ให้แตะในกล่อง กดค้าง แล้วเลือก “คัดลอก” ค่ะ</p>}
                </div>

                <a className="primary-button open-line-button" href="https://line.me/ti/p/~nan.insure" target="_blank" rel="noreferrer">เปิด LINE <span>→</span></a>
                <small>ไม่มีค่าใช้จ่ายในการคุยเบื้องต้น และยังไม่ผูกมัดในการทำประกัน</small>
              </div>

              <button className="restart-button" type="button" onClick={() => { setStep(1); setCopyState("idle"); }}>แก้ไขคำตอบอีกครั้ง</button>
            </div>
          )}
        </section>
      )}

      <section className="faq-wrap" aria-labelledby="faq-heading">
        <div className="faq-head">
          <p>คำถามที่พบบ่อย</p>
          <h2 id="faq-heading">ก่อนเริ่ม อยากรู้อะไรเพิ่มไหม?</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer><p>ผลลัพธ์เป็นคำแนะนำเบื้องต้น ไม่ใช่คำเสนอขาย การลงทุน หรือการรับประกันผลประโยชน์</p><span>แนน · ที่ปรึกษาประกันชีวิตและการเงิน AIA</span></footer>
    </main>
  );
}

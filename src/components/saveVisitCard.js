// Local-only export: no name, phone, network request, or persistent storage.
export async function saveVisitCard({ animal, repeat, carry, imageSrc }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1840;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas unavailable");
  const ink = "#163728",
    muted = "#5e6c60";
  // Warm detachable sheet on a sage backing; decorative rail stays outside text.
  c.fillStyle = "#e8eddf";
  c.fillRect(0, 0, 1080, 1840);
  c.fillStyle = "#fffdf6";
  c.fillRect(24, 24, 1032, 1784);
  c.beginPath();
  c.moveTo(24, 1808);
  for (let x = 24; x <= 1056; x += 12) c.lineTo(x, x % 24 === 0 ? 1816 : 1808);
  c.lineTo(1056, 1800); c.lineTo(24, 1800); c.closePath(); c.fill();
  c.strokeStyle = "#d5c9b3";
  c.lineWidth = 1;
  c.setLineDash([4, 6]);
  c.beginPath(); c.moveTo(94, 48); c.lineTo(94, 1776); c.stroke();
  c.setLineDash([]);
  for (let y = 70; y < 1770; y += 64) {
    c.fillStyle = "#b8c1ac";
    c.beginPath(); c.arc(56, y, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#e8eddf";
    c.beginPath(); c.arc(56, y + 1, 7, 0, Math.PI * 2); c.fill();
  }
  const text = (
    value,
    y,
    size = 30,
    color = ink,
    family = "Arial",
    weight = "normal",
  ) => {
    c.fillStyle = color;
    c.font = `${weight} ${size}px ${family}`;
    let line = "",
      cursor = y;
    for (const word of value.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (c.measureText(candidate).width > 868 && line) {
        c.fillText(line, 132, cursor);
        cursor += size * 1.5;
        line = word;
      } else line = candidate;
    }
    if (line) c.fillText(line, 132, cursor);
    return cursor + size * 1.5;
  };
  text("ЛЕСНАЯ", 110, 44, ink, "Georgia", "bold");
  // The same brand thread connects the beginning and end of the card.
  c.strokeStyle = "#8b9b7b";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(690, 90);
  c.bezierCurveTo(760, 10, 850, 160, 990, 65);
  c.stroke();
  c.fillStyle = "#b6742e";
  c.beginPath();
  c.arc(846, 84, 7, 0, Math.PI * 2);
  c.fill();
  text("ПАМЯТКА К ВИЗИТУ", 205, 24, muted);
  let y = text(
    `${animal} · ${repeat ? "повторный приём" : "первый приём"}`,
    275,
    46,
    ink,
    "Georgia",
  );
  if (imageSrc) {
    const illustration = new Image();
    illustration.src = imageSrc;
    await illustration.decode();
    // The same art as the selected website scene, with no cropping or distortion.
    const artWidth = 800,
      artHeight =
        (artWidth * illustration.naturalHeight) / illustration.naturalWidth;
    c.drawImage(illustration, 166, y + 8, artWidth, artHeight);
    y += artHeight + 32;
  }
  const rule = () => {
    c.strokeStyle = "#cbd3c1";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(132, y);
    c.lineTo(1000, y);
    c.stroke();
    y += 64;
  };
  rule();
  y = text("Возьмите с собой", y, 31, ink, "Arial", "bold") + 12;
  y =
    text(
      repeat
        ? "• Предыдущие назначения и новые результаты."
        : "• Ветпаспорт и прошлые обследования, если есть.",
      y,
      30,
      muted,
    ) + 8;
  y = text(`• ${carry}`, y, 30, muted) + 44;
  y = text("Расскажите врачу", y, 31, ink, "Arial", "bold") + 12;
  y =
    text(
      repeat
        ? "Что изменилось после приёма: аппетит, активность, симптомы и реакция на лечение."
        : "Когда появились симптомы, что изменилось в поведении, чем питается питомец и какие препараты получает.",
      y,
      30,
      muted,
    ) + 40;
  rule();
  y = text("Перед исследованиями", y, 31, ink, "Arial", "bold") + 12;
  y = text(
    "Подготовку уточните у врача. Памятка не заменяет консультацию.",
    y,
    30,
    muted,
  );
  if (y > 1680) throw new Error("Export content overflow");
  c.strokeStyle = "#ded8c7";
  c.beginPath(); c.moveTo(132, 1720); c.lineTo(1000, 1720); c.stroke();
  text("Вы рядом. Дальше разберёмся вместе.", 1770, 27, ink);
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (v) => (v ? resolve(v) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = `lesnaya-${animal === "Кошка" ? "cat" : "dog"}-${repeat ? "repeat" : "first"}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

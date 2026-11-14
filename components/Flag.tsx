// Drapeaux en SVG (rendu identique partout, contrairement aux emojis qui ne s’affichent pas sous Windows).
export default function Flag({ code, className = 'h-3.5 w-5' }: { code: 'US' | 'HT' | 'FR'; className?: string }) {
  const cls = className + ' flex-none rounded-[2px]';
  if (code === 'US') {
    return (
      <svg viewBox='0 0 28 20' className={cls} aria-hidden='true'>
        <rect width='28' height='20' fill='#fff' />
        {[0, 2, 4, 6].map((i) => (<rect key={i} y={(i * 20) / 7} width='28' height={20 / 7} fill='#B22234' />))}
        <rect width='12' height={(20 / 7) * 4} fill='#3C3B6E' />
        {[2.4, 6, 9.6].flatMap((x) => [2.2, 5.4, 8.6].map((y) => (<circle key={x + '-' + y} cx={x} cy={y} r='0.65' fill='#fff' />)))}
      </svg>
    );
  }
  if (code === 'FR') {
    return (
      <svg viewBox='0 0 28 20' className={cls + ' border border-neutral-200'} aria-hidden='true'>
        <rect width='9.34' height='20' fill='#0055A4' />
        <rect x='9.33' width='9.34' height='20' fill='#fff' />
        <rect x='18.66' width='9.34' height='20' fill='#EF4135' />
      </svg>
    );
  }
  return (
    <svg viewBox='0 0 28 20' className={cls} aria-hidden='true'>
      <rect width='28' height='10' fill='#00209F' />
      <rect y='10' width='28' height='10' fill='#D21034' />
      <rect x='8.5' y='5.5' width='11' height='9' fill='#fff' />
      <circle cx='14' cy='10' r='2' fill='#016A16' />
      <rect x='13.3' y='10.6' width='1.4' height='2.2' fill='#8a5a1c' />
    </svg>
  );
}

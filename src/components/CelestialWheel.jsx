const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
export default function CelestialWheel() {
  return <svg viewBox="0 0 520 520" fill="none" className="celestial-wheel" aria-hidden="true">
    <defs><radialGradient id="wheel-glow"><stop stopColor="#B7A3E8" stopOpacity=".18"/><stop offset="1" stopColor="#B7A3E8" stopOpacity="0"/></radialGradient></defs>
    <circle cx="260" cy="260" r="258" fill="url(#wheel-glow)"/>
    {[228,219,168,160,111,103].map(r => <circle key={r} cx="260" cy="260" r={r} stroke="#C7AF7B" strokeOpacity={r===219 || r===160 ? '.6' : '.25'} strokeWidth=".8"/>)}
    {Array.from({length:72},(_,i) => <path key={i} d={`M260 ${i%6===0 ? 22 : 27}V32`} stroke="#C7AF7B" strokeOpacity=".65" transform={`rotate(${i*5} 260 260)`}/>)}
    {signs.map((sign,i) => { const a=(i*30-75)*Math.PI/180; return <g key={sign}><path d="M260 41V100" stroke="#C7AF7B" strokeOpacity=".4" transform={`rotate(${i*30} 260 260)`}/><text x={260+192*Math.cos(a)} y={269+192*Math.sin(a)} fill="#DFCFAC" textAnchor="middle" fontSize="27" fontFamily="Georgia,serif">{sign}</text></g>; })}
    <g stroke="#C7AF7B" strokeOpacity=".4" strokeWidth=".8"><path d="M260 111 389 335H131ZM260 409 131 185H389Z"/><path d="M111 260H409M260 111V409" strokeDasharray="2 8"/></g>
    <circle cx="260" cy="260" r="76" fill="#26233E" stroke="#C7AF7B" strokeOpacity=".6"/><circle cx="260" cy="260" r="65" stroke="#C7AF7B" strokeOpacity=".2"/>
    <g stroke="#E3C990" strokeWidth="1.4"><circle cx="260" cy="260" r="22"/>{Array.from({length:16},(_,i) => <path key={i} d={`M260 226V${i%2===0 ? 216 : 221}`} transform={`rotate(${i*22.5} 260 260)`}/>)}</g><circle cx="260" cy="260" r="5" fill="#E3C990"/>
    {[[97,84],[421,99],[452,350],[82,370],[328,44]].map(([x,y]) => <path key={x} d={`M${x-5} ${y}h10M${x} ${y-5}v10`} stroke="#D9C398" strokeWidth=".8"/>)}
  </svg>;
}

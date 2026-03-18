export default function CrashMoonsLogo() {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1722 / 560' }}>
      <p className="absolute blur-[2px] font-['Moonwalk_Miss:Regular',sans-serif] leading-[normal] left-[11%] not-italic text-[clamp(2rem,8.7vw,150px)] text-white top-[34%] w-[82%] whitespace-pre-wrap">Crash Moons</p>
      <div className="absolute flex h-full items-center justify-center left-0 top-0 w-full" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none w-full h-full">
          <div className="border-[clamp(80px,9.5vw,163px)] border-[#ff1cf7] border-dashed w-full h-full" />
        </div>
      </div>
    </div>
  );
}

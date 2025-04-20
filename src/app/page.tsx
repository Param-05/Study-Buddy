import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundLines } from "@/components/ui/background-lines";
import AnimatedSubmitButton from "@/components/ui/customSubmitButton";


function HomePage() {
  const words = ["faster", "smarter", "easier", "better", "deeper", "together"];

  return (
    <div className="flex items-center justify-center w-full flex-col px-4">
    <BackgroundLines className="flex w-full flex-col px-4">
      {/* Slogan styled like "Aceternity" */}
      <div className="w-full mt-30 mb-10 flex flex-col items-center justify-center overflow-hidden rounded-md bg-transparent">
        <h1 className="md:text-5xl text-3xl lg:text-4xl font-bold text-center text-white relative w-[55rem] z-20 px-4">
          “No need to study cruddy — just use your Buddy!”
        </h1>

        <div className="w-[70rem] h-20 relative mt-4">
          {/* Sparkles effect */}
          <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
 
        {/* Radial Gradient to prevent sharp edges */}
        <div
  className="absolute inset-0 w-full h-full"
  style={{
    background: "var(--background)",
    maskImage: "radial-gradient(350px 200px at top, transparent 20%, white)",
    WebkitMaskImage: "radial-gradient(350px 200px at top, transparent 20%, white)",
  }}
></div>


        </div>
      </div>

   {/* FlipWords hero text */}
<div className="flex items-center justify-center px-4">
  <div className="mx-auto text-5xl sm:text-5xl lg:text-6xl font-semibold text-neutral-600 dark:text-neutral-300 text-center leading-tight">
    Study <FlipWords words={words} /> <br />
    every day with <span className="font-bold text-indigo-600 dark:text-indigo-400">Study Buddy</span>
  </div>
</div>
<div className="mt-10 flex justify-center">
  <div className="w-[30rem]">
        <AnimatedSubmitButton href="/notes">Start Studying</AnimatedSubmitButton>
  </div>
</div>

</BackgroundLines>

    </div>
  );
}

export default HomePage;

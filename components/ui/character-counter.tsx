interface CharacterCounterProps {
    current: number;
    max: number;
  }
  
  export function CharacterCounter({ current, max }: CharacterCounterProps) {
    const isNearLimit = current > max * 0.8;
    const isAtLimit = current >= max;
  
    return (
      <div className={`text-xs transition-colors ${
        isAtLimit 
          ? 'text-red-500' 
          : isNearLimit 
            ? 'text-amber-500' 
            : 'text-muted-foreground'
      }`}>
        {current}/{max} characters
      </div>
    );
  }
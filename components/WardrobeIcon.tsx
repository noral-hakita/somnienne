export default function WardrobeIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path d="M12 4v4l-8.5 5.5a1.5 1.5 0 0 0 .8 2.7h15.4a1.5 1.5 0 0 0 .8-2.7L12 8" />
    </svg>
  )
}
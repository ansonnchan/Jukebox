import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold tracking-[-0.01em] transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        primary:
          'border border-[#9f4f34] bg-[#b9603e] text-[#fff9ef] shadow-[0_12px_30px_rgba(98,45,28,0.18)] hover:-translate-y-0.5 hover:bg-[#a95337] hover:shadow-[0_16px_34px_rgba(98,45,28,0.23)]',
        secondary:
          'border border-[var(--color-border)] bg-[#fffaf1]/72 text-foreground shadow-[0_8px_24px_rgba(73,49,40,0.06)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_48%,transparent)] hover:bg-white',
        ghost: 'text-muted hover:bg-white/60 hover:text-foreground',
        quiet:
          'text-[var(--color-muted-strong)] hover:text-foreground',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

import { cn } from '@/lib/utils';

interface AppLogoProps {
    className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {
    return <img src="/logo.svg" alt="PPDS Pharmacy Prescription Dispensing System" className={cn('block h-8 w-auto object-contain', className)} />;
}

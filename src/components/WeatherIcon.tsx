import Image from "next/image";

export const iconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

export default function WeatherIcon({ icon, alt, size = 64 }: { icon: string; alt: string; size?: number }) {
  return <Image src={iconUrl(icon)} alt={alt} width={size} height={size} unoptimized />;
}

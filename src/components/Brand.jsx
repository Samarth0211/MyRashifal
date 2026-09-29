import Link from 'next/link';
import DesignIcon from './DesignIcon';
export default function Brand() {
  return <Link href="/" className="brand" aria-label="MyRashifal home"><span className="brand-symbol"><DesignIcon name="sun" size={29}/></span><span>myrashifal<span className="brand-plus">+</span><small>VEDIC WISDOM. EVERYDAY CLARITY.</small></span></Link>;
}

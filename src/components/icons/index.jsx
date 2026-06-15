import {
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineTrophy,
  HiOutlineFolderOpen,
  HiOutlineCalendar,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineStar,
  HiOutlineXCircle,
  HiOutlineCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';
import {
  MdEmojiEvents,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdOutlineBalance,
} from 'react-icons/md';
import { LuCircle } from 'react-icons/lu';
import SipensLogo from '../brand/SipensLogo';

const iconClass = 'w-5 h-5 shrink-0';

export const AppIcons = {
  dashboard: HiOutlineChartBar,
  criteria: HiOutlineClipboardDocumentList,
  ahp: MdOutlineBalance,
  sales: HiOutlineUserGroup,
  wpResult: HiOutlineTrophy,
  history: HiOutlineFolderOpen,
  calendar: HiOutlineCalendar,
  calendarDays: HiOutlineCalendarDays,
  trophy: HiOutlineTrophy,
  trophyFilled: MdEmojiEvents,
  check: HiOutlineCheckCircle,
  checkSimple: HiOutlineCheck,
  warning: HiOutlineExclamationCircle,
  error: HiOutlineXCircle,
  star: HiOutlineStar,
  folder: HiOutlineFolderOpen,
  users: HiOutlineUserGroup,
  chart: HiOutlineChartBar,
  close: HiOutlineXMark,
  circle: LuCircle,
  logo: SipensLogo,
  rank1: MdLooksOne,
  rank2: MdLooksTwo,
  rank3: MdLooks3,
};

export { default as SipensLogo } from '../brand/SipensLogo';

export function Icon({ name, className = iconClass, ...props }) {
  const Component = AppIcons[name];
  if (!Component) return null;
  return <Component className={className} aria-hidden="true" {...props} />;
}

export function RankIcon({ rank, className = 'w-5 h-5' }) {
  if (rank === 1) return <Icon name="rank1" className={className} />;
  if (rank === 2) return <Icon name="rank2" className={className} />;
  if (rank === 3) return <Icon name="rank3" className={className} />;
  return <span className="text-sm font-bold">{rank}</span>;
}

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { to: '/criteria', label: 'Kriteria', shortLabel: 'Kriteria', icon: 'criteria' },
  { to: '/ahp', label: 'AHP Bobot', shortLabel: 'AHP', icon: 'ahp' },
  { to: '/sales', label: 'Data Sales', shortLabel: 'Sales', icon: 'sales' },
  { to: '/wp-result', label: 'Hasil WP', shortLabel: 'WP', icon: 'wpResult' },
  { to: '/history', label: 'Riwayat', shortLabel: 'Riwayat', icon: 'history' },
];

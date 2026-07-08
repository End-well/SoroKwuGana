export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavDropdownItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: 'instagram' | 'tiktok' | 'youtube';
}

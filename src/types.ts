export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  video?: string;
  tags?: string[];
}

export interface VideoHighlight {
  id: string;
  url: string;
  title: string;
  activeOnTv?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface RestaurantData {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  openingHours: {
    weekdays: string;
    weekend: string;
    sunday: string;
  };
  sections: MenuSection[];
  highlights: VideoHighlight[];
  selectedTvHighlightIds?: string[];
  isSiteOpen?: boolean;
  activeAnnouncement?: string;
  heroImage?: string;
  logo?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
}

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
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface RestaurantData {
  name: string;
  tagline: string;
  sections: MenuSection[];
  highlights: VideoHighlight[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
}

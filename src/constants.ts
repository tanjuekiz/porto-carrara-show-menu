import { RestaurantData } from './types';

export const RESTAURANT_DATA: RestaurantData = {
  name: "Porto Carrara",
  tagline: "Culinaire revolutie op je bord",
  phone: "+32 2 123 45 67",
  email: "info@portocarrara.be",
  openingHours: {
    weekdays: "17:00 - 22:00",
    weekend: "17:00 - 23:00",
    sunday: "Gesloten"
  },
  sections: [
    {
      title: "Voorgerechten",
      items: [
        {
          id: "v1",
          name: "Burrata d'Abruzzo",
          description: "Fluweelzachte, romige burrata geserveerd met zongerijpte kerstomaatjes, aromatische verse basilicum en een verfijnde toets van zwarte truffelolie.",
          price: 14.50,
          image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=800",
          tags: ["Vegetarisch", "Populair", "Meest Gekozen"]
        },
        {
          id: "v2",
          name: "Carpaccio di Manzo",
          description: "Dungesneden runderhaas van topkwaliteit, rijkelijk bestrooid met vers geschaafde Parmezaanse kaas, geroosterde pijnboompitten en knapperige rucola.",
          price: 16.00,
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
          tags: ["Klassieker"]
        },
        {
          id: "v3",
          name: "Gegrilde Octopus",
          description: "Mals gegrilde octopus met een frisse citroen-kruidenolie, geserveerd op een zijdezachte puree van witte cannellini bonen.",
          price: 18.50,
          image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800",
          tags: ["Seafood Special"]
        }
      ]
    },
    {
      title: "Hoofdgerechten",
      items: [
        {
          id: "h1",
          name: "Dry-Aged Entrecôte",
          description: "300g botermals, 21 dagen gerijpt rundvlees. Perfect gegrild en geserveerd met knapperige seizoensgroenten en een krachtige rode wijnsaus.",
          price: 32.00,
          image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=800",
          tags: ["Chef's Choice", "Premium"]
        },
        {
          id: "h2",
          name: "Zalm en Croûte",
          description: "In goudbruin bladerdeeg gebakken zalmfilet, gevuld met romige spinazie en afgewerkt met een fluweelzachte dille-roomsaus.",
          price: 28.50,
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800",
          tags: ["Vers van de Afslag"]
        },
        {
          id: "h3",
          name: "Truffel Risotto",
          description: "Hemelse, romige risotto bereid met verse zwarte truffel, wilde bospaddenstoelen en 24 maanden gerijpte Parmezaanse kaas.",
          price: 24.00,
          image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800",
          tags: ["Vegetarisch", "Luxe"]
        }
      ]
    },
    {
      title: "Dranken",
      items: [
        {
          id: "d1",
          name: "Signature Negroni",
          description: "Onze eigen interpretatie van de klassieker: Premium Gin, Campari en Antica Formula met een aromatische sinaasappelzeste.",
          price: 12.00,
          image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800",
          tags: ["Huisgemaakt"]
        },
        {
          id: "d2",
          name: "Chardonnay 'Reserve'",
          description: "Een volle witte wijn met tonen van vanille en rijp fruit.",
          price: 8.50,
          image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "d3",
          name: "Huisgemaakte Limonade",
          description: "Verfrissende limonade met munt, vlierbloesem en gember.",
          price: 5.50,
          image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
        }
      ]
    }
  ],
  highlights: [
    {
      id: "h1",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Animatie: Het Konijn (Kids)",
      activeOnTv: true
    },
    {
      id: "h2",
      url: "https://vjs.zencdn.net/v/oceans.mp4",
      title: "Natuur: De Wonderlijke Oceaan",
      activeOnTv: true
    },
    {
      id: "h3",
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      title: "Natuur: Bloeiende Lente",
      activeOnTv: true
    },
    {
      id: "h4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      title: "Avontuur: De Grote Reis",
      activeOnTv: true
    },
    {
      id: "h5",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      title: "Cartoon: Bunny & Friends",
      activeOnTv: true
    },
    {
      id: "h6",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      title: "Fantasie: Droomwereld",
      activeOnTv: true
    },
    {
      id: "h7",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      title: "Actie: De Vuurvonk",
      activeOnTv: true
    }
  ],
  selectedTvHighlightIds: ["h1", "h2", "h3", "h4", "h5", "h6", "h7"],
  location: {
    address: "Culinairestraat 123, 1000 Brussel",
    lat: 50.8503,
    lng: 4.3517
  }
};

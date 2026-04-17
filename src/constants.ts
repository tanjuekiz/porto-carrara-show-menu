import { RestaurantData } from './types';

export const RESTAURANT_DATA: RestaurantData = {
  name: "Mission: Gastro",
  tagline: "Your Mission: Eat. Your Reward: Flavor.",
  phone: "+32 2 123 45 67",
  email: "info@missiongastro.be",
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
          image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
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
      title: "Pizza's",
      items: [
        {
          id: "p1",
          name: "Pizza Margarita",
          description: "De tijdloze klassieker met verse tomatensaus, smeuïge mozzarella en blaadjes verse basilicum.",
          price: 12.50,
          image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=1000",
          tags: ["Vegetarisch", "Populair"]
        },
        {
          id: "p2",
          name: "Pizza Diavola",
          description: "Voor de durvers: pikante salami, mozzarella en verse chilipepers op een bodem van tomatensaus.",
          price: 14.50,
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
          tags: ["Pittig"]
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
      id: "mi1",
      url: "https://vjs.zencdn.net/v/oceans.mp4",
      title: "The Chef's Mission - Keuken Infiltratie",
      activeOnTv: true
    },
    {
      id: "mi2",
      url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      title: "Vintage Selection - Operatie Bordeaux",
      activeOnTv: true
    },
    {
      id: "mi3",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      title: "Grill Protocol - Heat Exposure",
      activeOnTv: true
    },
    {
      id: "mi4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      title: "Precision Prep - De Groene Code",
      activeOnTv: true
    },
    {
      id: "mi5",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      title: "The Target - Steaming Revelation",
      activeOnTv: true
    },
    {
      id: "mi6",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      title: "Safe house Atmosphere - Diner bij Kaarslicht",
      activeOnTv: true
    },
    {
      id: "mi7",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      title: "Mission Victory - Champagne Toast",
      activeOnTv: true
    }
  ],
  selectedTvHighlightIds: ["mi1", "mi2", "mi3", "mi4", "mi5", "mi6", "mi7"],
  isSiteOpen: true,
  activeAnnouncement: "Welkom bij Mission: Gastro! Jouw culinaire missie begint hier.",
  heroImage: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000",
  logo: "", 
  location: {
    address: "Culinairestraat 123, 1000 Brussel",
    lat: 50.8503,
    lng: 4.3517
  }
};

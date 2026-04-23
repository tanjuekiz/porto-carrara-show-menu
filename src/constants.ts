import { RestaurantData } from './types';

export const RESTAURANT_DATA: RestaurantData = {
  name: "Porto Carrara",
  tagline: "Authentieke Italiaanse Gastronomie",
  phone: "+31 00 000 00 00",
  email: "info@portocarrara.nl",
  openingHours: {
    weekdays: "17:00 - 22:00",
    weekend: "17:00 - 23:00",
    sunday: "16:00 - 22:00"
  },
  sections: [
    {
      title: "Insalata",
      items: [
        { id: "i1", name: "Al pomodoro", description: "Tomatensalade, uien en olijven", price: 5.50, image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=800" },
        { id: "i2", name: "Mista", description: "Gemengde salade", price: 5.50, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800" },
        { id: "i3", name: "Insalata gorgonzola", description: "Gemengde salade met gorgonzola", price: 6.50, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
        { id: "i4", name: "Insalata feta", description: "Gemengde salade met feta kaas", price: 6.50, image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800" },
        { id: "i5", name: "Insalata mozzarella", description: "Gemengde salade met mozzarella", price: 6.50, image: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&q=80&w=800" },
        { id: "i6", name: "Mista al tonno", description: "Gemengde salade met tonijn", price: 7.00, image: "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800" },
        { id: "i7", name: "Mista capriciosa", description: "Gemengde salade met kaas en ansjovis", price: 7.50, image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800" },
        { id: "i8", name: "Sla caprese", description: "Tomaat, mozzarella en verse basilicum", price: 6.50, image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=800" },
        { id: "i9", name: "Mista pollo", description: "Gemengde salade, gekruid kipfilet", price: 7.50, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" },
        { id: "i10", name: "Garnalen cocktail", description: "Whiskeysaus, garnalen, citroen", price: 9.00, image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Antipasti",
      items: [
        { id: "a1", name: "Portie olijven", description: "Portie heerlijke olijven", price: 4.00, image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&q=80&w=800" },
        { id: "a2", name: "Portie patat", description: "Portie verse friet", price: 4.00, image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=800" },
        { id: "a3", name: "Brood met kruidenboter", description: "Vers gebakken brood", price: 4.00, image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&q=80&w=800" },
        { id: "a4", name: "Cipolla", description: "Traditionele uiensoep", price: 5.00, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800" },
        { id: "a5", name: "Minestrone", description: "Rijke groentesoep", price: 5.00, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800" },
        { id: "a6", name: "Pomodori", description: "Klassieke tomatensoep", price: 5.00, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800" },
        { id: "a7", name: "Funghi trifolati", description: "Gebakken champignons met boter en roomsaus", price: 7.50, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" },
        { id: "a8", name: "Lumache al forno", description: "Half dozijn slakken met knoflook en kruidenboter", price: 9.00, image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800" },
        { id: "a9", name: "Prosciutto", description: "Dunne plakjes gerookte ham", price: 7.00, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" },
        { id: "a10", name: "Proscuitto melone", description: "Gerookte ham met meloen", price: 9.00, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" },
        { id: "a11", name: "Carpaccio", description: "Gemarineerde ossenhaas met parmezaanse kaas", price: 9.00, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" },
        { id: "a12", name: "Calamari fritti", description: "Gefrituurde inktvisringen met salade", price: 9.00, image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Pasta's",
      items: [
        { id: "pa1", name: "Pesto crema", description: "Pasta in romige pestosaus", price: 8.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa2", name: "Al pomodoro", description: "Traditionele tomatensaus", price: 8.50, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800" },
        { id: "pa3", name: "Al funghi", description: "Rijke champignon saus", price: 8.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa4", name: "Bolognese", description: "Klassieke gehaktsaus", price: 8.00, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800" },
        { id: "pa5", name: "Della casa rosatto", description: "Huisgemaakte roze saus", price: 8.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa6", name: "Puttanesca", description: "Pikante saus met kappertjes en olijven", price: 9.50, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800" },
        { id: "pa7", name: "Alla ciociara", description: "Aubergines, paprika, champignons en tomatensaus", price: 9.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa8", name: "Panna prosciutto", description: "Ham, kaas en roomsaus", price: 8.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa9", name: "Salmone", description: "Verse zalm, roomsaus, uien en paprika", price: 12.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa10", name: "Diavola pikante", description: "Pikante worst, paprika en spaanse peper", price: 8.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa11", name: "Pesto broccoli", description: "Pasta met broccoli in pesto roomsaus", price: 8.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa12", name: "Al tonno", description: "Tonijn, knoflook en tomatensaus", price: 9.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa13", name: "Aglio e olio pikante", description: "Olijfolie, knoflook, italianse kruiden, spaanse peper", price: 8.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa14", name: "Quattro formaggi", description: "4 soorten Italiaanse kaas in roomsaus", price: 11.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa15", name: "Pirata", description: "Gehakt, champignons, paprika en chilli pepers", price: 9.50, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa16", name: "Carbonara", description: "Spek, eieren, kaas en roomsaus", price: 11.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa17", name: "Frutti di mare", description: "Verschillende zeevruchten in tomatensaus", price: 12.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
        { id: "pa18", name: "Scampi", description: "Pasta met grote garnalen", price: 13.00, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Al forno's",
      items: [
        { id: "f1", name: "Lasagne paprika pikante", description: "Paprika, spaanse pepers, tomatensaus en kaas", price: 9.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f2", name: "Lasagne quattro formaggi", description: "4 soorten kaas, tomaten roomsaus", price: 10.50, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f3", name: "Lasagne frutti di mare", description: "Tomatensaus, kaas, zeecocktail", price: 12.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f4", name: "Lasagne bolognese", description: "Gehaktsaus, kaas en bechamelsaus", price: 9.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f5", name: "Lasagne vegeteriana", description: "Champignons, paprika, tomatensaus en kaas", price: 9.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f6", name: "Canneloni bolognese", description: "Vleesgevulde deegrolletjes met gehaktsaus", price: 9.50, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f7", name: "Lasagne salmone", description: "Zalm, tomaten roomsaus, kaas en knoflook", price: 12.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" },
        { id: "f8", name: "Gamberoni al forno", description: "Grote garnalen uit de oven met feta kaas", price: 13.00, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Carni's",
      items: [
        { id: "c1", name: "Bistecca sicilliana", description: "Gegrilde entrecote met champignons en kappertjes", price: 25.00, image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=800" },
        { id: "c2", name: "Filetto alla griglia", description: "Malse gegrilde ossenhaas", price: 26.00, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
        { id: "c3", name: "Filetto ala funghi", description: "Ossenhaas gebakken met champignons in roomsaus", price: 26.00, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
        { id: "c4", name: "Filetto al pepe verde", description: "Ossenhaas in groene pepersaus en cognac", price: 27.00, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
        { id: "c5", name: "Filetto di pollo", description: "Kipfilet met tomaten en roomsaus", price: 18.00, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
        { id: "c6", name: "Pollo al funghi", description: "Kipfilet van de grill met pikante champignons", price: 18.00, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
        { id: "c7", name: "Costolette di agnello", description: "Gemarineerde lamskoteletten van de grill", price: 25.00, image: "https://images.unsplash.com/photo-1602491993989-4960f58093f4?auto=format&fit=crop&q=80&w=800" },
        { id: "c8", name: "Entrecote", description: "Klassiek gegrilde entrecote", price: 24.00, image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Pizza's",
      items: [
        { id: "p1", name: "Margherita", description: "Tomatensaus en kaas", price: 6.50, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&q=80&w=800" },
        { id: "p2", name: "Bolognese", description: "Met gehaktsaus", price: 8.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p3", name: "Hawaii", description: "Met ham en ananas", price: 9.00, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
        { id: "p4", name: "Salami", description: "Met plakjes salami", price: 9.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p5", name: "Salsiccia (pepperoni)", description: "Met pittige pepperoni", price: 9.50, image: "https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800" },
        { id: "p6", name: "Vegetariana", description: "Met verschillende groenten", price: 9.50, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=800" },
        { id: "p7", name: "Americano", description: "Salami, paprika, pikante worst en kaas", price: 9.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p8", name: "Mexicano pikante", description: "Kip, mais, paprika en spaanse peper", price: 10.00, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
        { id: "p9", name: "Tonno", description: "Met tonijn en uien", price: 9.50, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p10", name: "Quattro formaggi", description: "Met 4 soorten kaas", price: 11.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p11", name: "Frutti di mare", description: "Met verschillende zeevruchten", price: 11.00, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
        { id: "p12", name: "Porto carrara", description: "Specialiteit van het huis", price: 10.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
        { id: "p13", name: "Shoarma", description: "Gekruid vlees, kaas en tomatensaus", price: 9.50, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
        { id: "p14", name: "Scampi", description: "Gamba's met uien en paprika", price: 12.00, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Calzone's",
      items: [
        { id: "cz1", name: "Calzone speciale", description: "Salami, ham, artijokken en gehaktsaus", price: 9.00, image: "https://images.unsplash.com/photo-1628830601003-847863001804?auto=format&fit=crop&q=80&w=800" },
        { id: "cz2", name: "Calzone shoarma", description: "Gekruid vlees met tomatensaus", price: 9.00, image: "https://images.unsplash.com/photo-1628830601003-847863001804?auto=format&fit=crop&q=80&w=800" },
        { id: "cz3", name: "Calzone pollo", description: "Gekruid kipfilet met uien", price: 9.00, image: "https://images.unsplash.com/photo-1628830601003-847863001804?auto=format&fit=crop&q=80&w=800" },
        { id: "cz4", name: "Calzone hawaii", description: "Ham en ananas in een gevouwen pizza", price: 9.00, image: "https://images.unsplash.com/photo-1628830601003-847863001804?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Dolci",
      items: [
        { id: "do1", name: "Tiramisu", description: "Origineel Italiaans dessert", price: 6.00, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800" },
        { id: "do2", name: "Macedonia di fruitte", description: "Fruitsalade met slagroom en ijs", price: 6.00, image: "https://images.unsplash.com/photo-1519915028121-70e99d12b21c?auto=format&fit=crop&q=80&w=800" },
        { id: "do3", name: "Dama biancha", description: "Vanille ijs met chocoladesaus en slagroom", price: 6.00, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Frisdranken",
      items: [
        { id: "dr1", name: "Frisdranken", description: "Cola, Sprite, Ice Tea, etc.", price: 2.75, image: "https://images.unsplash.com/photo-1581005014612-51b01297ce1d?auto=format&fit=crop&q=80&w=800" },
        { id: "dr2", name: "Jus d'orange", description: "Versgeperste sinaasappelsap", price: 3.20, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800" }
      ]
    }
  ],
  highlights: [
    { id: "final_v1", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Kids: Big Buck Bunny", activeOnTv: true },
    { id: "final_v2", url: "https://media.w3.org/2010/05/bunny/trailer.mp4", title: "Kids: Bunny Trailer", activeOnTv: true },
    { id: "final_v3", url: "https://vjs.zencdn.net/v/oceans.mp4", title: "Kids/Nature: Ocean Wonders", activeOnTv: true },
    { id: "final_v4", url: "https://media.w3.org/2010/05/sintel/trailer.mp4", title: "Action/Drama: Sintel Story", activeOnTv: true },
    { id: "final_v5", url: "https://media.w3.org/2010/05/video/movie_300.mp4", title: "Action: Cinematic Sequence", activeOnTv: true },
    { id: "final_v6", url: "https://www.w3schools.com/html/movie.mp4", title: "Drama: Nature's Peace", activeOnTv: true },
    { id: "final_v7", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4", title: "Action: City Movement", activeOnTv: true }
  ],
  selectedTvHighlightIds: ["final_v1", "final_v2", "final_v3", "final_v4", "final_v5", "final_v6", "final_v7"],
  isSiteOpen: true,
  activeAnnouncement: "Welkom bij Porto Carrara! Onze nieuwe digitale menukaart is nu live.",
  heroImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000",
  logo: "", 
  location: {
    address: "Markt 1, 1000 Amsterdam",
    lat: 52.3676,
    lng: 4.9041
  }
};

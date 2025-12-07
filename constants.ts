
import { MapData, Language } from './types';

export const MAPS: MapData[] = [
  {
    id: 'bermuda',
    name: 'Bermuda',
    image: 'https://i.ibb.co/zVZRhrzW/BERMUDA.jpg',
    cities: [
      'RIM', 'PEAK', 'SENTOSA', 'CLOCK', 'BIMA', 'CAPE', 'SHIP', 'KATU', 
      'MILL', 'MARS', 'HANGAR', 'GRAVE', 'OBS', 'POCHI', 'PFM', 'FACTORY', 'REPRESA'
    ]
  },
  {
    id: 'purgatorio',
    name: 'Purgatório',
    image: 'https://i.ibb.co/JR6RxXdZ/PURGAT-RIO.jpg',
    cities: [
      'LUMBER', 'FIELDS', 'ILHA', 'CENTRAL', 'BR CIMA', 'QUARRY', 'MARBLE', 
      'CROSS', 'FORGE', 'SKI', 'FIRE', 'MT VILA', 'GOLF', 'CAMPSITE', 'BR BAIXO', 'MTGQ'
    ]
  },
  {
    id: 'alpine',
    name: 'Alpine',
    image: 'https://i.ibb.co/M5SKjzyg/ALPINE.jpg',
    cities: [
      'FOZ', 'VANTAGEM', 'ESTAÇÃO', 'NEVADO', 'GUARNIÇÃO', 'DOCAS', 'COLONIA', 
      'F VERMELHA', 'VILAREJO', 'LIBERDADE', 'QUARTEL', 'FERROVIARIA', 'LITORAL', 'CARROSSEL', 'USINA'
    ]
  },
  {
    id: 'novaterra',
    name: 'Nova Terra',
    image: 'https://i.ibb.co/bgrHzY8R/NOVA-TERRA.jpg',
    cities: [
      'PONTES GÊMEAS', 'ACD DE BOXE', 'UNIVERSIDADE', 'MANGUEZAL', 'GALERIA DECA', 'PARQUE', 
      'TIROLESA', 'CIDADE VELHA', 'MUSEU', 'FAZENDINHA', 'FEIRA PLAZA', 'VIADUTO', 'PLANETARIO', 'ROBO'
    ]
  },
  {
    id: 'kalahari',
    name: 'Kalahari',
    image: 'https://i.ibb.co/Mxtfgvm0/KALAHARI.jpg',
    cities: [
      'PLAYGROUND', 'PRISÃO', 'SANTUÁRIO', 'RUINAS', 'P SEGURO', 'REFINARIA', 'LABIRINTO', 
      'P COMANDO', 'ASSENTAMENTO', 'SUBMARINO', 'CAMARA', 'C ELEFANTES', 'P BAU'
    ]
  },
  {
    id: 'solara',
    name: 'Solara',
    image: 'https://i.ibb.co/nMzg9Qbs/SOLARA.jpg',
    cities: [
      'ENSEADA', 'TORRE DE TV', 'PISCINÃO', 'MOINHO', 'ROLIUDE', 'LABORATORIO', 'ARCO', 
      'RESORT', 'CACHOEIRA', 'FLORESOPOLIS', 'AQUARIO', 'PARQUE', 'CLUBE DA CELA'
    ]
  }
];

export const WARNINGS: Record<Language, string[]> = {
  pt: [
    "⚠️ ATENÇÃO COM AS REGRAS",
    "TROCACÃO LIBERADA NA 1A SAFE APARECER, SEM RUSHS DESNECESSÁRIOS",
    "DEIXEM TODOS OS MAPAS JÁ PRONTOS",
    "TROCACÃO LIBERADA NA 2A SAFE",
    "TROCACÃO LIBERADA NA 3A SAFE",
    "PROIBIDO X1 INICIAL",
    "CAIAM SOMENTE EM SUAS CALLS",
    "EVITEM RUSHS DESNECESSÁRIOS"
  ],
  en: [
    "⚠️ ATTENTION TO RULES",
    "FIGHTING ALLOWED WHEN 1ST ZONE APPEARS, NO UNNECESSARY RUSHES",
    "GET ALL MAPS READY",
    "FIGHTING ALLOWED AT 2ND ZONE",
    "FIGHTING ALLOWED AT 3RD ZONE",
    "NO EARLY 1V1s",
    "LAND ONLY AT YOUR CALLS",
    "AVOID UNNECESSARY RUSHES"
  ],
  es: [
    "⚠️ ATENCIÓN A LAS REGLAS",
    "PELEA PERMITIDA AL APARECER LA 1RA ZONA, SIN RUSH INNECESARIO",
    "TENGAN TODOS LOS MAPAS LISTOS",
    "PELEA PERMITIDA EN LA 2DA ZONA",
    "PELEA PERMITIDA EN LA 3RA ZONA",
    "PROHIBIDO PVP INICIAL",
    "CAIGAN SOLO EN SUS CALLS",
    "EVITEN RUSH INNECESARIO"
  ]
};

export const CHARACTERS = [
  { id: 'a124', name: 'A124', image: 'https://i.ibb.co/fzTd41Lx/A124.png' },
  { id: 'orion', name: 'ORION', image: 'https://i.ibb.co/7xr1ys7f/ORION.png' },
  { id: 'skyler', name: 'SKYLER', image: 'https://i.ibb.co/0RhD9WNz/SKYLER.png' },
  { id: 'steffie', name: 'STEFFIE', image: 'https://i.ibb.co/1GJv2jqG/STEFFIE.png' },
  { id: 'iris', name: 'IRIS', image: 'https://i.ibb.co/x8Fhfsty/IRIS.png' },
  { id: 'cr7', name: 'CR7', image: 'https://i.ibb.co/TqHmqFrH/CR7.png' },
  { id: 'tatsuya', name: 'TATSUYA', image: 'https://i.ibb.co/rK6NSGgF/TATSUYA.png' },
  { id: 'homero', name: 'HOMERO', image: 'https://i.ibb.co/qLD3MckR/HOMERO.png' },
  { id: 'dimitri', name: 'DIMITRI', image: 'https://i.ibb.co/YB8WTZpL/DIMITRI.png' },
  { id: 'evelyn', name: 'EVELYN', image: 'https://i.ibb.co/N6HnVHmh/EVELYN.png' },
  { id: 'kamir', name: 'KAMIR', image: 'https://i.ibb.co/605w44By/KAMIR.png' },
  { id: 'santino', name: 'SANTINO', image: 'https://i.ibb.co/sd1Kz8Gj/SANTINO.png' },
  { id: 'koda', name: 'KODA', image: 'https://i.ibb.co/849xyhhR/KODA.png' },
  { id: 'ryden', name: 'RYDEN', image: 'https://i.ibb.co/1YWRw9yF/RYDEN.png' },
  { id: 'oscar', name: 'OSCAR', image: 'https://i.ibb.co/KzKM9VKT/OSCAR.png' },
  { id: 'kassie', name: 'KASSIE', image: 'https://i.ibb.co/qYD4KqYj/KASSIE.png' },
  { id: 'kenta', name: 'KENTA', image: 'https://i.ibb.co/nXycc5H/KENTA.png' },
  { id: 'extrema', name: 'EXTREMA', image: 'https://i.ibb.co/C3Nv8cYH/EXTREMA.png' },
  { id: 'alok', name: 'ALOK', image: 'https://i.ibb.co/JwG3C41h/ALOK.png' },
  { id: 'ignis', name: 'IGNIS', image: 'https://i.ibb.co/7N2n6qC0/IGNIS.png' },
  { id: 'wukong', name: 'WUKONG', image: 'https://i.ibb.co/W4JLHZXz/WUKONG.png' },
  { id: 'nero', name: 'NERO', image: 'https://i.ibb.co/9HSp4GsC/NERO.png' }
];

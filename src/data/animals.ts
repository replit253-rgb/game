import { Animal } from '../types';

export const ALL_ANIMALS: Animal[] = [
  { id: 'anjing_laut', name: 'Anjing Laut', image: '/assets/Object/Anjing_Laut.png', category: 'Mamalia Laut', habitat: 'Lautan & Pantai Es', food: 'Ikan & Kepiting', funFact: 'Anjing laut bisa menahan napas di dalam air hingga 20 menit!' },
  { id: 'ayam', name: 'Ayam', image: '/assets/Object/Ayam.png', category: 'Unggas', habitat: 'Peternakan & Kebun', food: 'Biji-bijian & Cacing', funFact: 'Ayam jantan berkokok dipagi hari untuk menandai wilayahnya.' },
  { id: 'babi', name: 'Babi', image: '/assets/Object/Babi.png', category: 'Mamalia', habitat: 'Peternakan & Hutan', food: 'Tumbuhan & Buah', funFact: 'Babi adalah hewan yang sangat cerdas dan punya penciuman tajam!' },
  { id: 'bebek', name: 'Bebek', image: '/assets/Object/Bebek.png', category: 'Unggas', habitat: 'Danau & Sungai', food: 'Ikan Kecil & Serangga', funFact: 'Bulu bebek dilapisi minyak alami agar tidak basah saat berenang.' },
  { id: 'beruang', name: 'Beruang', image: '/assets/Object/Beruang.png', category: 'Mamalia', habitat: 'Hutan & Pegunungan', food: 'Madu, Ikan & Buah', funFact: 'Beruang sangat suka makan madu lezat dan pandai memanjat pohon!' },
  { id: 'burung_beo', name: 'Burung Beo', image: '/assets/Object/Burung_Beo.png', category: 'Burung', habitat: 'Hutan Tropis', food: 'Biji & Buah-buahan', funFact: 'Burung beo pintar menirukan kata-kata dan suara manusia!' },
  { id: 'burung_elang', name: 'Burung Elang', image: '/assets/Object/Burung_Elang.png', category: 'Burung Pemangsa', habitat: 'Pegunungan & Angkasa', food: 'Ikan & Daging', funFact: 'Penglihatan elang sangat tajam, bisa melihat mangsa dari kejauhan!' },
  { id: 'burung_hantu', name: 'Burung Hantu', image: '/assets/Object/Burung_Hantu.png', category: 'Burung Malam', habitat: 'Pohon Pepohonan', food: 'Serangga & Tikus', funFact: 'Kepala burung hantu bisa berputar hingga 270 derajat!' },
  { id: 'hyena', name: 'Hyena', image: '/assets/Object/Hyena.png', category: 'Mamalia Karnivora', habitat: 'Padang Rumput Savana', food: 'Daging', funFact: 'Suara panggil hyena terdengar sangat mirip dengan suara tertawa manusia!' },
  { id: 'iguana', name: 'Iguana', image: '/assets/Object/Iguana.png', category: 'Reptil', habitat: 'Hutan & Tepian Sungai', food: 'Daun & Bunga', funFact: 'Iguana adalah perenang yang handal saat melarikan diri dari bahaya.' },
  { id: 'koala', name: 'Koala', image: '/assets/Object/Koala.png', category: 'Marsupial', habitat: 'Hutan Eukaliptus', food: 'Daun Eukaliptus', funFact: 'Koala bisa tidur hingga 18-22 jam setiap harinya!' },
  { id: 'kuda', name: 'Kuda', image: '/assets/Object/Kuda.png', category: 'Mamalia', habitat: 'Padang Rumput', food: 'Rumput & Jerami', funFact: 'Kuda bisa tidur sambil berdiri dengan mengunci sendi kakinya!' },
  { id: 'landak', name: 'Landak', image: '/assets/Object/Landak.png', category: 'Mamalia Kecil', habitat: 'Semak-semak Hutan', food: 'Serangga & Buah', funFact: 'Tubuh landak dilindungi ribuan duri tajam yang aman saat menggulung.' },
  { id: 'macan_tutul', name: 'Macan Tutul', image: '/assets/Object/Macan_Tutul.png', category: 'Kucing Besar', habitat: 'Hutan & Savana', food: 'Daging', funFact: 'Macan tutul sangat kuat membawa mangsa berat memanjat ke atas pohon!' },
  { id: 'serigala', name: 'Serigala', image: '/assets/Object/Serigala.png', category: 'Mamalia Karnivora', habitat: 'Hutan & Pegunungan', food: 'Daging', funFact: 'Serigala melolong di malam hari untuk berkomunikasi dengan kawanannya.' },
  { id: 'tikus', name: 'Tikus', image: '/assets/Object/Tikus.png', category: 'Kekerat', habitat: 'Sarang & Lubang Tanah', food: 'Biji-bijian & Makanan', funFact: 'Gigi depan tikus terus tumbuh sehingga mereka suka mengerat benda!' },
  { id: 'trenggiling', name: 'Trenggiling', image: '/assets/Object/Trenggiling.png', category: 'Mamalia Bersisik', habitat: 'Hutan Tropis', food: 'Semut & Rayap', funFact: 'Trenggiling menggulung tubuhnya menjadi bola keras saat merasa terancam.' },
  { id: 'ular', name: 'Ular', image: '/assets/Object/Ular.png', category: 'Reptil', habitat: 'Hutan & Rawa', food: 'Katak & Katak Kecil', funFact: 'Ular menggunakan lidahnya yang bercabang untuk mendeteksi bau di udara.' },
  { id: 'unta', name: 'Unta', image: '/assets/Object/Unta.png', category: 'Mamalia', habitat: 'Gurun Pasir Panas', food: 'Rumput & Tumbuhan', funFact: 'Punuk unta menyimpan cadangan lemak energi untuk bertahan di gurun!' },
  { id: 'kangguru', name: 'Kangguru', image: '/assets/Object/kangguru.png', category: 'Marsupial', habitat: 'Padang Rumput Australia', food: 'Rumput & Tumbuhan', funFact: 'Ibu kangguru membawa bayinya yang lucu di dalam kantong perutnya!' }
];

export const PRESET_LEVELS = [
  {
    level: 1,
    name: 'Level 1 (Mudah)',
    animalCount: 2,
    presetIds: ['kuda', 'beruang']
  },
  {
    level: 2,
    name: 'Level 2 (Sedang)',
    animalCount: 4,
    presetIds: ['bebek', 'tikus', 'babi', 'ular']
  },
  {
    level: 3,
    name: 'Level 3 (Tantangan)',
    animalCount: 6,
    presetIds: ['iguana', 'hyena', 'burung_hantu', 'anjing_laut', 'burung_beo', 'macan_tutul']
  },
  {
    level: 4,
    name: 'Level 4 (Pakar Satwa)',
    animalCount: 6,
    presetIds: ['ayam', 'burung_elang', 'koala', 'landak', 'serigala', 'trenggiling']
  },
  {
    level: 5,
    name: 'Level 5 (Juara Rimba)',
    animalCount: 8,
    presetIds: ['kangguru', 'unta', 'macan_tutul', 'beruang', 'anjing_laut', 'hyena', 'burung_beo', 'kuda']
  }
];

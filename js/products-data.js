const PRODUCTS = [
  {
    id: 'deconstructed-bomber',
    name: 'Mason Jacket 001',
    category: 'Tops',
    subcategory: 'Jackets',
    price: 320,
    constructedOn: 'April 2023',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/1.jpg',
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/1.png',
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/3.png',
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/4.png',
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/5.png',
      './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/6.png',
    ],
    description: `A bomber jacket rebuilt from unused leather jackets, taken apart, cut into individual pieces and reconstructed into a patchworked shell of 100% reclaimed leather sparking life back into the materials once left unused.

A rayon dark silver grey lining adds shine to the inside of the jacket. Cotton rib knit finishes the cuffs, collar and hem; a stainless steel zip and single flat welt pockets complete the front.`,
  },
  {
    id: '3d-panel-bomber',
    name: 'Slater Jacket 001',
    category: 'Tops',
    subcategory: 'Jackets',
    price: 340,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/3D Panel Bomber Jacket - Look 3 Top/24.jpg',
      './assets/ss24-reedit/Look 3/IMG_6298.jpg',
      './assets/photos/PRODUCTS/3D Panel Bomber Jacket - Look 3 Top/2_VSCO 3.JPG',
      './assets/ss24-reedit/Look 3/DSC04180.jpg',
      './assets/photos/PRODUCTS/3D Panel Bomber Jacket - Look 3 Top/4AA042A9-08D3-488A-A147-C9A6784B1D37.JPG',
    ],
    description: `A cropped bomber jacket with built in 3D construction throughout. Each panel is cut from individual triangle pieces, raised and reinforced with firm interfacing which are heat-pressed along the edges to sharpen the effect.

Rib knit finishes along the collar, neck and cuffs, fully lined inside and finished with a stainless steel double-sided zip to complete the jacket.`,
  },
  {
    id: 'phyllite-jacket',
    name: 'Phyllite Jacket',
    category: 'Tops',
    subcategory: 'Jackets',
    colorway: 'Wax',
    variantLabel: 'Select Version',
    swatch: '#19191b',
    colorVariants: ['phyllite-jacket', 'phyllite-jacket-v2'],
    price: 70,
    images: [
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2297.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1748.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1791.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1930.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1942.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1961.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2103.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2370.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2246.jpg',
    ],
    description: `The subtle black two tone denim jacket is separated by its front and back panels seamlessly transitioning throughout the jacket's shoulders, sleeves and sides. Appearing in an exaggerated silhouette with a high crop on the body along with elongated sleeves and stainless steel buttons.

Like a Phyllite stone reaching its metamorphosis due to subjected heat and pressure, the jacket is given an added sheen during an in-house waxing procedure that elevates the jacket's look and feel. The Phyllite Jacket is fully lined inside with a soft and light 100% cotton lining for extra comfort.`,
    material: '100% Cotton Denim, Stainless Steel Hardware',
    sizes: ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5'],
  },
  {
    id: 'phyllite-jacket-v2',
    name: 'Phyllite Jacket V2',
    category: 'Tops',
    subcategory: 'Jackets',
    colorway: 'Fabric Paint',
    variantLabel: 'Select Version',
    swatch: '#353539',
    colorVariants: ['phyllite-jacket', 'phyllite-jacket-v2'],
    price: 80,
    images: [
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3420.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3453.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3306.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3504.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3464.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3629.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3577.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3662.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3884.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3889.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3941.jpg',
      './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3951.jpg',
    ],
    description: `The subtle black two tone denim jacket is separated by its front and back panels seamlessly transitioning throughout the jacket's shoulders, sleeves and sides. Appearing in an exaggerated silhouette with a high crop on the body along with elongated sleeves and stainless steel buttons.

Like a Phyllite stone reaching its metamorphosis due to subjected heat and pressure, the jacket is given an added sheen during an in-house fabric painting procedure that elevates the jacket's look and feel. The Phyllite Jacket is fully lined inside with a soft and light 100% cotton lining for extra comfort.`,
    material: '100% Cotton Denim, Stainless Steel Hardware',
    sizes: ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5'],
  },
  {
    id: 'lorimer-selvedge-denim',
    name: 'Lorimer Selvedge Denim — Blue',
    category: 'Bottoms',
    subcategory: 'Denim',
    colorway: 'Blue',
    swatch: '#2b3a55',
    colorVariants: ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'],
    price: 80,
    images: [
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2520.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2851.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2644.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2749.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2577.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2882.jpg',
    ],
    description: `Constructed from a 100% Japanese Selvedge Denim fabric, a brand new pair arrives as a heavy structured pair which over time molds to the wearer's body and movements enhancing the silhouette to fit the personality of its wearer.

The silhouette is more snug at the waist and thigh area opening up to a wider leg allowing the bottom hem to fall beautifully on any footwear. Refer to the size guide provided for specific measurements.

Finished with a contrasting stitch, back pocket design, strong wide belt loops, a cow leather waistband patch, embroidered coin pocket, a stainless steel button and rivets and roomy pockets with easy access.`,
    material: '100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware',
    sizes: ['30×30', '30×32', '32×30', '32×32', '32×34', '34×32', '34×34'],
  },
  {
    id: 'lorimer-selvedge-denim-black',
    name: 'Lorimer Selvedge Denim — Black',
    category: 'Bottoms',
    subcategory: 'Denim',
    colorway: 'Black',
    swatch: '#1a1a1a',
    colorVariants: ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'],
    price: 80,
    images: [
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3161.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3223.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3100.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3063.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3233.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3177.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3294.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3884.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3889.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3941.jpg',
      './assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3951.jpg',
    ],
    description: `Constructed from a 100% Japanese Selvedge Denim fabric, a brand new pair arrives as a heavy structured pair which over time molds to the wearer's body and movements enhancing the silhouette to fit the personality of its wearer.

The silhouette is more snug at the waist and thigh area opening up to a wider leg allowing the bottom hem to fall beautifully on any footwear. Refer to the size guide provided for specific measurements.

Finished with a contrasting stitch, back pocket design, strong wide belt loops, a cow leather waistband patch, embroidered coin pocket, a stainless steel button and rivets and roomy pockets with easy access.`,
    material: '100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware',
    sizes: ['30×30', '30×32', '32×30', '32×32', '32×34', '34×32', '34×34'],
  },
  {
    id: 'reconstructed-button-up-1',
    name: 'Mercer Shirt 001',
    category: 'Tops',
    subcategory: 'Shirts',
    price: 185,
    constructedOn: 'April 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/10.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/11.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/IMG_6251.JPG',
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/IMG_6352.JPG',
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/IMG_6328.JPG',
    ],
    description: `A reconstruction project made with reclaimed shirts and scraps of fabrics that are brought together into a single shirt made from separate panels.

A boxy fitting shirt with a wider fit and a cropped body, the shirt is finished with a front pocket, six front buttons along with sleeve plackets and cuffs.`,
  },
  {
    id: 'reconstructed-button-up-2',
    name: 'Mercer Shirt 002',
    category: 'Tops',
    subcategory: 'Shirts',
    price: 185,
    constructedOn: 'April 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/8.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/9.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/IMG_6539.JPG',
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/IMG_6624.JPG',
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/IMG_6699.JPG',
    ],
    description: `A reconstruction project made with reclaimed shirts and scraps of fabrics that are brought together into a single shirt made from separate panels.

A relaxed regular fit, the shirt is finished with an elevated back yoke, front pocket, six front buttons along with sleeve plackets and cuffs.`,
  },
  {
    id: 'university-striped-sweatshirt',
    name: 'UoL Sweatshirt 001',
    category: 'Tops',
    subcategory: 'Sweatshirts',
    price: 210,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/University of Lorimer Striped Sweatshirt - Look 2 Top/20.jpg',
      './assets/photos/PRODUCTS/University of Lorimer Striped Sweatshirt - Look 2 Top/3_VSCO.JPG',
      './assets/ss24-reedit/Look 2/EditTest.jpg',
      './assets/ss24-reedit/Look 2/DSC04153.jpg',
      './assets/photos/PRODUCTS/University of Lorimer Striped Sweatshirt - Look 2 Top/76F2B413-5A03-475A-A578-184DE63203E9.JPG',
    ],
    description: `Crimson boiled wool fabric and black cotton knit fabric pieces are cut into individual panels which are sewn together to create the sweatshirt.

A University of Lorimer collegiate logo is printed across the chest with a distressing finish on the sleeve hems. The sweatshirt comes in a relaxed, boxy fit.`,
  },
  {
    id: 'distressed-lorimer-cap',
    name: 'Sterling Cap 003',
    category: 'Accessories',
    subcategory: 'Hats',
    price: 85,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Distressed Lorimer Cap/1.png',
    ],
    description: `A distressed logo cap, dyed black after construction for a deep black-on-black finish.

Lorimer is embroidered in cursive at the front in tonal thread achieved by the dyeing process. Frayed edges, one size with an adjustable strap.`,
  },
  {
    id: 'zip-up-top',
    name: 'Moulder Top 001',
    category: 'Tops',
    subcategory: "Women's Tops",
    price: 195,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/1-3%20Zip%20Up%20Top%20-%20Look%205%20Top/18.jpg',
      './assets/photos/PRODUCTS/1-3%20Zip%20Up%20Top%20-%20Look%205%20Top/2_VSCO%205.JPG',
      './assets/photos/PRODUCTS/1-3%20Zip%20Up%20Top%20-%20Look%205%20Top/IMG_0584_VSCO.JPG',
      './assets/photos/PRODUCTS/1-3%20Zip%20Up%20Top%20-%20Look%205%20Top/6CB18551-BC69-437A-A16D-4DE974995852.JPG',
    ],
    description: `A fitted top of elastane-blended panels in grey and black that stretch to sculpt the body through curved seams.

Our quarter zip with custom hardware finishes the neckline.`,
  },
  {
    id: 'asymmetrical-white-top',
    name: 'Fowler Top 001',
    category: 'Tops',
    subcategory: "Women's Tops",
    price: 165,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Asymmetrical White Top - Look 4 Top/22.jpg',
      './assets/photos/PRODUCTS/Asymmetrical White Top - Look 4 Top/18.png',
      './assets/photos/PRODUCTS/Asymmetrical White Top - Look 4 Top/IMG_0686_VSCO.JPG',
      './assets/photos/PRODUCTS/Asymmetrical White Top - Look 4 Top/IMG_0655_VSCO.JPG',
      './assets/photos/PRODUCTS/Asymmetrical White Top - Look 4 Top/EE2693BD-823D-43C5-8FB6-F2620A8E827B.JPG',
    ],
    description: `An asymmetrically cut form fitting top features only one shoulder seam, a contoured seam that wraps around the torso from back to front and elbow cut-outs on the sleeves.

Made from a white lightweight cotton, the fabric stretches to follow the body's silhouette.`,
  },
  {
    id: 'westworld-button-up',
    name: 'Fletcher Shirt 001',
    category: 'Tops',
    subcategory: 'Shirts',
    price: 175,
    constructedOn: 'May 2023',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/3.jpg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/DSC_0215.jpg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/DSC_0263.jpg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/IMG_2953.jpeg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/IMG_2958.jpeg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/IMG_3040.jpg',
    ],
    description: `A modernized western shirt in a midweight blend of 55% cotton and 45% linen fabric. Integrated yokes across the back and shoulders recall classic western tailoring, while the cropped body and elbow-length sleeves remix the silhouette.

The shirt is finished with a camp collar and five embossed metal buttons.`,
  },
  {
    id: 'zip-up-utility-vest',
    name: 'Gardner Vest 001',
    category: 'Tops',
    subcategory: 'Vests',
    price: 220,
    constructedOn: 'June 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Zip Up Utility Vest/2.jpg',
      './assets/photos/PRODUCTS/Zip Up Utility Vest/IMG_3737.jpg',
    ],
    description: `The vest is constructed from a polycotton shell with a soft 100% cotton jersey lining inside.

A slim, structured ozark vest comes packed with facings across the front and back, two front pockets, a rib knit collar and a stainless steel zip to finish the garment.`,
  },
  {
    id: 'dual-texture-knit-vest',
    name: 'Franklin Vest 001',
    category: 'Tops',
    subcategory: 'Vests',
    price: 200,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Dual Texture Knit Vest - Look 1 Top/16.jpg',
      './assets/ss24-reedit/Look 1/DSC04170.jpg',
      './assets/ss24-reedit/Look 1/IMG_6267.jpg',
    ],
    description: `Two cotton knit fabrics combine together by a contoured seam across the front and back. The rib knit fabric finishes the neck and hem while the boucle knit contours the body.`,
  },
  {
    id: 'layered-denim-jeans',
    name: 'Weaver Jeans 002',
    category: 'Bottoms',
    subcategory: 'Denim',
    price: 245,
    constructedOn: 'November 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/4.jpg',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_7885.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_8054.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_8172.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_8175.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_7844.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_8039.JPG',
      './assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_8068.JPG',
    ],
    description: `The weaver denim takes two layers of fabrics sewn on top of one another: a printed 100% cotton twill underneath with a 100% cotton denim layer on top.

The denim is cut to expose its yarns, which bloom after a careful wash and dry process giving the textile its full effect.

The jeans are a straight cut silhouette with a slight widening taper at the hem.`,
  },
  {
    id: 'layered-denim-shorts',
    name: 'Weaver Shorts 001',
    category: 'Bottoms',
    subcategory: 'Denim',
    price: 195,
    constructedOn: 'November 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/6.jpg',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7821.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7762.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7769.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7785.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7641.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7700.JPG',
      './assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7814.JPG',
    ],
    description: `The weaver denim takes two layers of fabrics sewn on top of one another: a soft boiled wool jersey fabric underneath with a 100% cotton denim layer on top.

The denim is cut to expose its yarns, which bloom after a careful wash and dry process giving the textile its full effect.

The barrel shaped shorts are fitted to the waist with a longer leg that falls past the knee.`,
  },
  {
    id: 'westworld-straight-jeans',
    name: 'Fletcher Jeans 002',
    category: 'Bottoms',
    subcategory: 'Denim',
    price: 235,
    constructedOn: 'May 2023',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Westworld Straight Leg Jeans/7.jpg',
      './assets/photos/PRODUCTS/Westworld Straight Leg Jeans/DSC_0205.jpg',
      './assets/photos/PRODUCTS/Westworld Straight Leg Jeans/IMG_2945.jpg',
      './assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/IMG_2947.jpeg',
      './assets/photos/PRODUCTS/Westworld Straight Leg Jeans/IMG_3045.jpg',
    ],
    description: `Constructed from a blue 100% cotton denim, this straight leg cut pair of jeans tapers wider at the bottom hem to achieve a puddling visual effect over any footwear.`,
  },
  {
    id: 'adjustable-button-trousers',
    name: 'Clasper Trousers 002',
    category: 'Bottoms',
    subcategory: 'Trousers',
    price: 215,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Adjustable Button Trousers - Look 1 Bottoms/17.jpg',
      './assets/ss24-reedit/Look 1/DSC04171.jpg',
      './assets/ss24-reedit/Look 1/IMG_6269.jpg',
    ],
    description: `Black cotton twill trousers with six magnetic closures across from the knee point to the leg opening.

The buttons can be opened or closed adjusting the silhouette of the trousers from an overlapping straight leg shape all the way to a flared bell bottom look.`,
  },
  {
    id: 'mens-straight-trousers',
    name: 'Foreman Trousers 002',
    category: 'Bottoms',
    subcategory: 'Trousers',
    price: 215,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Mens Straight Cut Trousers - Look 2 Bottoms/21.jpg',
    ],
    description: `A brown pair of trousers with a subtle horizontal green stripe print across constructed from a sturdy cotton twill.

The straight leg shape hugs the legs comfortably and stacks at the hem, the trousers are finished with both side and back pockets.`,
  },
  {
    id: 'denim-leather-trousers',
    name: 'Lacquer Trousers 002',
    category: 'Bottoms',
    subcategory: 'Trousers',
    price: 265,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Denim and Leather Trousers - Look 3 Bottoms/25.jpg',
    ],
    description: `A wide pair of straight leg trousers transition from a soft polycotton denim crotch into a faux leather leg.

Each leg is built from four panels two on the sides and one on the front and back. Each panel is sewn down with french seams to ensure the leather stays in place, the heavyweight feel gives the trousers a rich drape.`,
  },
  {
    id: 'reinforced-pinstripe-trousers',
    name: 'Sawyer Trousers 003',
    category: 'Bottoms',
    subcategory: 'Trousers',
    price: 235,
    constructedOn: 'April 2025',
    madeIn: 'Finland',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Reinforced Pinstripe Trousers/12.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 1/IMG_6393.jpg',
      './assets/photos/PRODUCTS/Reconstructed Button Up 2/IMG_6712.JPG',
    ],
    description: `A lightweight wool crepe fabric with metallic silver pinstriping reinforced with a second layer of lightweight cotton voile fabric attached beneath the top layer, adding weight and a cleaner fall through the leg.

The side seam wraps to the front, and raw hems reveal the bottom layer at the leg opening. A sturdier fabric on the waistband carries the added weight, fastened with a matte black button. Straight cut, flat front, with side adjusters and front pockets.`,
  },
  {
    id: 'womens-wide-trousers',
    name: 'Carder Trousers 002',
    category: 'Bottoms',
    subcategory: 'Trousers',
    price: 215,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Womens Wide Cut Trousers - Look 5 Bottoms/19.jpg',
      './assets/photos/PRODUCTS/Womens Wide Cut Trousers - Look 5 Bottoms/16.png',
    ],
    description: `Lightweight, breathable cotton trousers with an elastic waistband.

The trousers fit tightly at the waist and widen significantly at the leg opening to create its desired silhouette.`,
  },
  {
    id: 'overlapped-fray-skirt',
    name: 'Webster Skirt 003',
    category: 'Bottoms',
    subcategory: 'Skirts',
    price: 195,
    constructedOn: 'May 2023',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/14.jpg',
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/DSC_0107.jpg',
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/DSC_0129.jpg',
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/IMG_3029.jpeg',
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/IMG_2981.jpeg',
      './assets/photos/PRODUCTS/Overlapped Fray Skirt/DSC_0279.jpg',
    ],
    description: `The construction of this skirt comes from cutting our polycotton lightweight fabric into patterns resembling a pair of trousers, these patterns are then overlapped into the shape of a mid-length wrap skirt leaving raw edges which are frayed to create the aspired effect.

The overlapping patterns are held together inside of the waistband with an invisible zipper attached for accessibility.`,
  },
  {
    id: 'white-layered-skirt',
    name: 'Lyster Skirt 004',
    category: 'Bottoms',
    subcategory: 'Skirts',
    price: 185,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/White Layered Texture Skirt - Look 4 Bottom/23.jpg',
      './assets/photos/PRODUCTS/White Layered Texture Skirt - Look 4 Bottom/Skirtt.png',
    ],
    description: `A skirt combining textiles each individually bleach-treated and layered together to form an asymmetrical A-line skirt shape.

Four fabrics including mesh, pleats and ribbing details cut into different shaped panels held together with an elastic waistband to complete the garment.`,
  },
  {
    id: 'upcycled-two-piece',
    name: 'Hosier Two Piece 002',
    category: 'Bottoms',
    subcategory: 'Skirts',
    price: 450,
    constructedOn: 'February 2023',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Upcycled Two Piece Suit/15.jpg',
      './assets/photos/PRODUCTS/Upcycled Two Piece Suit/Upsycle.Photo.Best.jpg',
      './assets/photos/PRODUCTS/Upcycled Two Piece Suit/82699B49-7632-4C84-B578-A3CC458E2F70.JPG',
    ],
    description: `For this project, a large glen check tweed blazer was upcycled into a two piece set of a cropped blazer jacket and a skirt.

A matching plaid fabric hangs from the side of the skirt with a magnetic button closure system, the skirt is completed with two double welt pockets made from that same plaid fabric.`,
  },
  {
    id: 'trigall-dress',
    name: 'Trigall Dress 001',
    category: 'Dresses',
    price: 380,
    constructedOn: 'August 2022',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/Trigall Dress/13.jpg',
      './assets/photos/PRODUCTS/Trigall Dress/Pic1.Edited.jpg',
      './assets/photos/PRODUCTS/Trigall Dress/Pic2.Edited.jpg',
    ],
    description: `Cut from an emerald colored 100% acetate fabric, the dress joins triangular panels to construct a structured top that falls into a full-length skirt with a slit for fluid movement held in harmony by a binding tape in the same emerald tone.`,
  },
  {
    id: 'ss24-dress',
    name: 'Manuta Dress 001',
    category: 'Dresses',
    price: 360,
    constructedOn: 'May 2024',
    madeIn: 'Spain',
    notForSale: true,
    oneOfOne: true,
    images: [
      './assets/photos/PRODUCTS/SS24 Dress/26.jpg',
      './assets/photos/PRODUCTS/SS24 Dress/IMG_0742_VSCO.JPG',
      './assets/photos/PRODUCTS/SS24 Dress/942E4476-5B3C-45E8-8140-BD56FB69AC83.JPG',
    ],
    description: `The final look of Spring / Summer 2024. A jumpsuit made from stretchy elastane forms the base with a long sleeve for the left arm which transitions into a taffeta headpiece doubling as a short sleeve for the right arm.

That same taffeta completes the dress as a double layered skirt top layer being a short skirt while the bottom layer falls to ankle length.`,
  },
].map(product => ({
  ...product,
  available: ['phyllite-jacket', 'phyllite-jacket-v2', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'].includes(product.id),
}));

if (typeof module !== 'undefined') module.exports = PRODUCTS;

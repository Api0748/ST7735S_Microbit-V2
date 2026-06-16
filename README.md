# LCD_ST7735_MicrobitV2

Revoltman electronics

Cette bibliothèque est un correctif (fork) optimisé pour l'écran **Waveshare 1.8inch LCD for micro:bit**. Elle résout définitivement le bug d'allocation mémoire qui faisait crasher la **micro:bit V2** (erreurs Panic) avec l'extension officielle, tout en conservant une compatibilité ascendante.

## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

---

## 🚀 Comment l'installer dans MakeCode ?

1. Ouvrez votre projet sur [MakeCode micro:bit](https://makecode.microbit.org/).
2. Cliquez sur l'icône d'engrenage (Paramètres) en haut à droite ⚙️ -> **Extensions**.
3. Dans la barre de recherche, collez l'URL de votre dépôt GitHub :
   `https://github.com/Api0748/ST7735S_Microbit-V2`
4. Cliquez sur le module pour l'ajouter à votre boîte à outils.

---

## 📌 Brochage matériel (Pins Waveshare 1.8")

L'extension configure automatiquement les broches de la micro:bit pour correspondre parfaitement au câblage interne du Shield Waveshare :

| Signal LCD | Broche micro:bit (Pin) | Rôle |
| :--- | :--- | :--- |
| **CS** | P1 | Chip Select |
| **DC** | P2 | Data / Command Selection |
| **RST** | P8 | Reset matériel |
| **BL** | P16 | Contrôle du rétroéclairage |
| **SPI MOSI** | P15 | Transfert de données |
| **SPI SCK** | P13 | Horloge SPI |

---

## 💻 Exemples d'utilisation

### 1. Initialisation propre (Au démarrage)
Au branchement, l'écran affiche des pixels aléatoires ("nuage"). Il est indispensable d'initialiser et de nettoyer l'écran immédiatement dans le bloc `au démarrage` :

```blocks
LCD1IN8.LCD_Init()
LCD1IN8.LCD_Clear()

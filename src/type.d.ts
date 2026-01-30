import { PaletteColor } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {

    customButton?: {
      colorBackground?: string,
      colorText?: string
    };

    customNavbar?: {
      background?: string,
      color?: string,
      menuTextColor?: string,
      icon?: string
    };

  }

  interface PaletteOptions {

    customButton?: {
      colorBackground?: string,
      colorText?: string
    };

    customNavbar?: {
      background?: string,
      color?: string
      menuTextColor?: string
      icon?: string
    };

  }
}

type Tag = {
  id: string;
  name: string;
  color: string
};

type Task = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  tags: Tag[];
  order: number
};

type Column = {
  id: string;
  workspaceId: string;
  title: string;
  order: number
};

type Workspace = {
  id: string;
  title: string;
  image?: string;
  imageId?: string;
};

type GalleryImage = {
  id: string;
  url: string;
};
import { ISpace } from "./api";
import { Node, FormatBlockColor, TCodeLanguage, Block, TPermissionRole, Permission, ParentProps, Schema } from "./types";

export interface PageProps {
  title: string[][],
  [k: string]: string[][]
}

export interface PageFormat {
  page_icon: string,
  page_font: string,
  page_full_width: boolean,
  page_small_text: boolean,
  block_locked_by: string,
  block_locked: boolean,
  page_cover: string,
  page_cover_position: number,
  block_color?: FormatBlockColor
}

export interface MediaProps {
  source: string[][],
  caption?: string[][]
}

export interface MediaFormat {
  block_aspect_ratio?: number,
  block_full_width?: boolean,
  block_page_width?: boolean,
  block_preserve_scale?: boolean,
  block_width?: number,
  display_source: string
}

export interface WebBookmarkFormat {
  bookmark_cover: string,
  bookmark_icon: string,
  block_color?: FormatBlockColor
}

export interface WebBookmarkProps {
  link: string[][],
  description: string[][],
  title: string[][],
  caption?: string[][]
}

export interface CodeFormat {
  code_wrap: boolean
}

export interface CodeProps {
  title: string[][],
  language: TCodeLanguage
}

export interface FileProps {
  title: string[][],
  source: string[][],
  caption?: string[][]
}

export interface FileFormat {
  block_color?: FormatBlockColor
}

export interface TodoProps {
  title: string[][],
  checked: ("Yes" | "No")[][]
}
// -----------------

/* Function API Params*/

export interface IPageInput {
  type: 'page',
  properties: PageProps,
  format: PageFormat
}

export interface IVideoInput {
  type: 'video',
  properties: MediaFormat,
  format: MediaFormat
}

export interface IImageInput {
  type: 'image',
  properties: MediaFormat,
  format: MediaFormat
}

export interface IAudioInput {
  type: 'audio',
  properties: MediaFormat,
  format: MediaFormat
}

export interface IWebBookmarkInput {
  type: 'bookmark',
  properties: WebBookmarkProps,
  format: WebBookmarkFormat
}

export interface ICodeInput {
  type: 'code',
  properties: CodeProps,
  format: CodeFormat
}

export interface IFileInput {
  type: 'file',
  properties: FileProps,
  format: FileFormat
}

export interface ICommonTextInput {
  properties: {
    title: string[][]
  },
  format: {
    block_color?: FormatBlockColor
  }
}

export interface ITextInput extends ICommonTextInput {
  type: 'text'
}

export interface IHeaderInput extends ICommonTextInput {
  type: 'header'
}

export interface ISubHeaderInput extends ICommonTextInput {
  type: 'sub_header'
}

export interface ISubSubHeaderInput extends ICommonTextInput {
  type: 'sub_sub_header'
}

export interface INumberedListInput extends ICommonTextInput {
  type: 'numbered_list'
}

export interface IBulletedListInput extends ICommonTextInput {
  type: 'bulleted_list'
}

export interface IToggleInput extends ICommonTextInput {
  type: 'toggle'
}

export interface IQuoteInput extends ICommonTextInput {
  type: 'quote'
}

export interface IDividerInput {
  type: 'divider',
  properties?: {},
  format?: {}
}

export interface ICalloutInput extends ICommonTextInput {
  type: 'callout',
  format: {
    page_icon: string,
    block_color?: FormatBlockColor
  }
}

export interface ITodoInput {
  type: 'to_do',
  properties: TodoProps,
  format: {
    block_color?: FormatBlockColor
  }
}

export interface ITOCInput {
  type: 'table_of_contents',
  format: {
    block_color?: FormatBlockColor
  },
  properties?: {}
}

export interface IEquationInput {
  type: 'equation',
  properties: {
    title: string[][]
  },
  format: {
    block_color?: FormatBlockColor
  }
}

export interface IFactoryInput {
  type: 'factory',
  properties: {
    title: string[][]
  },
  format: {
    block_color?: FormatBlockColor
  },
  contents: TBlockInput[]
}

export interface IBreadcrumbInput {
  type: 'breadcrumb',
  properties?: {},
  format?: {},
}

export type TBlockInput = IPageInput | IVideoInput | IImageInput | IAudioInput | IWebBookmarkInput | ICodeInput | IFileInput | ITextInput | ITodoInput | IHeaderInput | ISubHeaderInput | ISubSubHeaderInput | IBulletedListInput | INumberedListInput | IToggleInput | IQuoteInput | IDividerInput | ICalloutInput | ITOCInput | IEquationInput | IFactoryInput | IBreadcrumbInput;
// -----------------

export interface IPage extends Block {
  properties: PageProps,
  type: 'page',
  content?: string[],
  format: PageFormat,
  is_template?: boolean
}

export interface IPublicPermission {
  type: 'public_permission',
  role: TPermissionRole,
  allow_duplicate: boolean
}

export interface IRootPage extends IPage {
  permissions: (Permission | IPublicPermission)[]
}

export interface ICollectionBlock extends Block {
  view_ids: string[],
  collection_id: string,
  type: 'collection_view' | 'collection_view_page'
}

export interface ICollectionView extends ICollectionBlock {
  type: 'collection_view',
}

export interface ICollectionViewPage extends ICollectionBlock {
  type: 'collection_view_page',
}

// Media Block Types
export interface IVideo extends Block, IVideoInput { };
export interface IAudio extends Block, IAudioInput { };
export interface IImage extends Block, IImageInput { };
export interface IWebBookmark extends Block, IWebBookmarkInput { };
export interface ICode extends Block, ICodeInput { };
export interface IFile extends Block, IFileInput { };

// Basic Block Types
export interface IText extends ITextInput, Block { }
export interface ITodo extends ITodoInput, Block { }
export interface IHeader extends IHeaderInput, Block { }
export interface ISubHeader extends ISubHeaderInput, Block { }
export interface ISubSubHeader extends ISubSubHeaderInput, Block { }
export interface IBulletedList extends IBulletedListInput, Block { }
export interface INumberedList extends INumberedListInput, Block { }
export interface IToggle extends IToggleInput, Block { }
export interface IQuote extends IQuoteInput, Block { }
export interface IDivider extends IDividerInput, Block { }
export interface ICallout extends ICalloutInput, Block { }

// Advanced block types
export interface ITOC extends ITOCInput, Block { };
export interface IEquation extends IEquationInput, Block { };
export interface IBreadcrumb extends IBreadcrumbInput, Block { };
export interface IFactory extends Block {
  type: 'factory',
  properties: {
    title: string[][]
  },
  format: {
    block_color?: FormatBlockColor
  },
  contents: string[]
}

export type TCollectionBlock = ICollectionView | ICollectionViewPage;

// ? TD:2:H Add all block type
export type TBlock = IRootPage | TCollectionBlock | IPage | IHeader | ISubHeader | ISubSubHeader | IText | ITodo | IBulletedList | INumberedList | IToggle | IQuote | IDivider | ICallout | IVideo | IAudio | IImage | IWebBookmark | ICode | IFile | ITOC | IEquation | IFactory | IBreadcrumb;

export type ParentType = IRootPage | ISpace;

export interface ICollection extends Node, ParentProps {
  description: string[][],
  icon?: string,
  migrated: boolean,
  name: string[][],
  schema: Schema,
  template_pages?: string[]
}
// src/type/department.ts
export interface GalleryItem {
  type: 'image' | 'video'
  url: string
}

export interface DepartmentItem {
  id: number
  title: string
  content?: string
  cover_image: string
  gallery: GalleryItem[]
  created_at?: string
  updated_at?: string
}

export type ViewMode = 'card' | 'list'

export interface GalleryFile {
  file: File
  preview: string
}

import { apiClient } from '../api/client'
import type { GeneratedDocument } from '../types/document'
import type { SgaeDocumentResponse } from './concertService'

// Lista de documentos del músico logueado
export async function getMyDocuments(): Promise<GeneratedDocument[]> {
    const response = await apiClient.get<GeneratedDocument[]>('/v1/documents/mine')
    return response.data
}

// URL de descarga prefirmada (fresca) para un documento ya generado
export async function getDocumentDownloadUrl(id: number): Promise<SgaeDocumentResponse> {
    const response = await apiClient.get<SgaeDocumentResponse>(`/v1/documents/${id}/download`)
    return response.data
}

// Borra un documento propio (registro + PDF en S3)
export async function deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`/v1/documents/mine/${id}`)
}

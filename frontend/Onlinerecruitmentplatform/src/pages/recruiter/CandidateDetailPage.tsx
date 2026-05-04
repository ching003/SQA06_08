import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Button, Input, Modal, Spin } from 'antd';
import {
  ArrowLeftOutlined, DownloadOutlined,
  FileTextOutlined, BookOutlined, BookFilled, EditOutlined, LinkOutlined
} from '@ant-design/icons';
import { CV } from '../../lib/types';
import { cvService } from '../../api/services';
import { toast } from 'sonner';
import { CVContentView } from '../../components/cv/CVContentView';

export function CandidateDetailPage() {
  const { id: cvId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCv] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Fetch CV by ID
  useEffect(() => {
    const fetchCV = async () => {
      if (!cvId) return;

      try {
        setIsLoading(true);
        const cvData = await cvService.getCVById(cvId);
        setCv(cvData);

        // Set PDF URL if available
        if (cvData.pdfUrl) {
          setPdfUrl(cvData.pdfUrl);
        }
      } catch (error: any) {
        console.error('Failed to fetch CV:', error);
        toast.error(error?.message || 'Không thể tải thông tin CV');
        setCv(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCV();
  }, [cvId]);

  // Check if CV is saved and fetch notes
  useEffect(() => {
    const checkSavedAndFetchNotes = async () => {
      if (!cvId) return;
      try {
        const saved = await cvService.checkCVSaved(cvId);
        setIsSaved(saved);

        // If saved, try to get notes from saved CVs
        if (saved) {
          const response = await cvService.getSavedCVs({ page: 1, limit: 100 });
          const savedCV = response.items.find(item => item.cvId === cvId);
          if (savedCV && savedCV.notes) {
            setNotes(savedCV.notes);
          }
        }
      } catch (error) {
        console.error('Failed to check saved status:', error);
      }
    };
    checkSavedAndFetchNotes();
  }, [cvId]);

  // Handle click save button - show modal if not saved, unsave if already saved
  const handleSaveClick = async () => {
    if (!cvId || isSaving) return;

    if (isSaved) {
      // Unsave
      try {
        setIsSaving(true);
        await cvService.unsaveCV(cvId);
        setIsSaved(false);
        setNotes('');
        toast.success('Đã bỏ lưu CV');
      } catch (error: any) {
        console.error('Failed to unsave CV:', error);
        toast.error(error?.message || 'Không thể bỏ lưu CV');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Open modal to add notes before saving
      setEditedNotes('');
      setIsNotesModalOpen(true);
    }
  };

  // Handle save CV with notes (from modal)
  const handleSaveCVWithNotes = async () => {
    if (!cvId || isSavingNotes) return;

    try {
      setIsSavingNotes(true);
      await cvService.saveCV(cvId, editedNotes || undefined);
      setIsSaved(true);
      setNotes(editedNotes);
      setIsNotesModalOpen(false);
      toast.success('Đã lưu CV');
    } catch (error: any) {
      console.error('Failed to save CV:', error);
      toast.error(error?.message || 'Không thể lưu CV');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Handle update notes (for already saved CV)
  const handleUpdateNotes = async () => {
    if (!cvId || isSavingNotes) return;

    try {
      setIsSavingNotes(true);
      await cvService.updateSavedCVNotes(cvId, editedNotes);
      setNotes(editedNotes);
      setIsNotesModalOpen(false);
      toast.success('Đã cập nhật ghi chú');
    } catch (error: any) {
      console.error('Failed to update notes:', error);
      toast.error(error?.message || 'Không thể cập nhật ghi chú');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Open notes modal for editing (already saved CV)
  const openEditNotesModal = () => {
    setEditedNotes(notes);
    setIsNotesModalOpen(true);
  };

  const handleDownload = async () => {
    if (!cvId || !cv) return;

    // If CV already has pdfUrl, open it directly
    if (cv.pdfUrl) {
      window.open(cv.pdfUrl, '_blank');
      toast.success('Đã mở CV trong tab mới');
      return;
    }

    // Otherwise, generate PDF by calling export API, then fetch updated CV
    try {
      setIsExporting(true);

      // Call export API to generate PDF (backend saves file and updates CV with pdfUrl)
      await cvService.exportCV(cvId);

      // Fetch updated CV to get the new pdfUrl
      const updatedCV = await cvService.getCVById(cvId);
      setCv(updatedCV);

      // Update pdfUrl state if available
      if (updatedCV.pdfUrl) {
        setPdfUrl(updatedCV.pdfUrl);
        window.open(updatedCV.pdfUrl, '_blank');
        toast.success('Đã mở CV trong tab mới');
      } else {
        toast.error('Không thể tạo file PDF');
      }
    } catch (error: any) {
      console.error('Failed to export CV:', error);
      toast.error(error?.message || 'Không thể tải xuống CV');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-8">
            Quay lại
          </Button>
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
            <p className="text-base text-gray-600 mb-4">Không tìm thấy CV</p>
            <Button onClick={() => navigate('/recruiter/candidates')}>
              Quay lại danh sách
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const candidateName = cv.fullName || cv.user?.fullName || 'Chưa cập nhật';

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type={isSaved ? "primary" : "default"}
              icon={isSaved ? <BookFilled /> : <BookOutlined />}
              onClick={handleSaveClick}
              loading={isSaving}
            >
              {isSaved ? 'Bỏ lưu' : 'Lưu CV'}
            </Button>
            {isSaved && (
              <Button
                icon={<EditOutlined />}
                onClick={openEditNotesModal}
              >
                {notes ? 'Sửa ghi chú' : 'Thêm ghi chú'}
              </Button>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              loading={isExporting}
            >
              Tải xuống
            </Button>
            {pdfUrl && (
              <Button
                icon={<LinkOutlined />}
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                Mở tab mới
              </Button>
            )}
          </div>
        </div>

        {/* Candidate Info */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">{candidateName}</h1>
          <p className="text-base text-gray-600">{cv.title || 'CV'}</p>
        </div>

        {/* Notes Section (if saved and has notes) */}
        {isSaved && notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <EditOutlined className="text-lg text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium text-amber-800 mb-1">Ghi chú của bạn</h3>
                  <p className="text-sm text-amber-700 whitespace-pre-wrap">{notes}</p>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={openEditNotesModal}
                className="text-amber-700 hover:text-amber-800"
              />
            </div>
          </div>
        )}

        {/* PDF Preview or CV Content View */}
        {pdfUrl ? (
          <Card className="glassmorphism overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
              title={`CV - ${candidateName}`}
            />
          </Card>
        ) : (
          <CVContentView cv={cv} />
        )}
      </div>

      {/* Notes Modal - for both saving new CV and editing notes */}
      <Modal
        open={isNotesModalOpen}
        onCancel={() => setIsNotesModalOpen(false)}
        onOk={isSaved ? handleUpdateNotes : handleSaveCVWithNotes}
        okText={isSaved ? 'Lưu' : 'Lưu CV'}
        cancelText="Hủy"
        confirmLoading={isSavingNotes}
        title={isSaved ? 'Sửa ghi chú' : 'Lưu CV'}
      >
        <Input.TextArea
          placeholder="Ghi chú (không bắt buộc)..."
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}

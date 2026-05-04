import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Modal, Spin } from 'antd';
import { SearchOutlined, FileTextOutlined, BookOutlined } from '@ant-design/icons';
import { cvService, SavedCV } from '../../api/services/cvService';
import { toast } from 'sonner';
import { CVCard, CVCardData } from '../../components/recruiter/CVCard';

export function SavedCVsPage() {
  const navigate = useNavigate();
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [editNotesModal, setEditNotesModal] = useState<{ open: boolean; savedCV: SavedCV | null }>({
    open: false,
    savedCV: null,
  });
  const [editedNotes, setEditedNotes] = useState('');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; savedCV: SavedCV | null }>({
    open: false,
    savedCV: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch saved CVs
  const fetchSavedCVs = async () => {
    try {
      setIsLoading(true);
      const response = await cvService.getSavedCVs({ page, limit: 12 });
      setSavedCVs(response.items);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error: any) {
      console.error('Failed to fetch saved CVs:', error);
      toast.error(error?.message || 'Không thể tải danh sách CV đã lưu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCVs();
  }, [page]);

  // Filter CVs by search term
  const filteredCVs = savedCVs.filter((savedCV) => {
    if (!searchTerm) return true;
    const cv = savedCV.cv;
    if (!cv) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      cv.fullName?.toLowerCase().includes(searchLower) ||
      cv.title?.toLowerCase().includes(searchLower) ||
      cv.currentPosition?.toLowerCase().includes(searchLower) ||
      savedCV.notes?.toLowerCase().includes(searchLower) ||
      cv.skills?.some((s) =>
        (typeof s === 'string' ? s : s.skillName).toLowerCase().includes(searchLower)
      )
    );
  });

  // Handle unsave CV
  const handleUnsaveCV = async () => {
    if (!deleteConfirm.savedCV) return;

    try {
      setIsDeleting(true);
      await cvService.unsaveCV(deleteConfirm.savedCV.cvId);
      toast.success('Đã bỏ lưu CV');
      fetchSavedCVs();
    } catch (error: any) {
      console.error('Failed to unsave CV:', error);
      toast.error(error?.message || 'Không thể bỏ lưu CV');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ open: false, savedCV: null });
    }
  };

  // Handle update notes
  const handleUpdateNotes = async () => {
    if (!editNotesModal.savedCV) return;

    try {
      setIsUpdatingNotes(true);
      await cvService.updateSavedCVNotes(editNotesModal.savedCV.cvId, editedNotes);
      toast.success('Đã cập nhật ghi chú');
      fetchSavedCVs();
    } catch (error: any) {
      console.error('Failed to update notes:', error);
      toast.error(error?.message || 'Không thể cập nhật ghi chú');
    } finally {
      setIsUpdatingNotes(false);
      setEditNotesModal({ open: false, savedCV: null });
    }
  };

  // Open edit notes modal
  const openEditNotesModal = (savedCV: SavedCV) => {
    setEditedNotes(savedCV.notes || '');
    setEditNotesModal({ open: true, savedCV });
  };

  // Transform SavedCV to CVCardData
  const savedCVToCardData = (savedCV: SavedCV): CVCardData | null => {
    const cv = savedCV.cv;
    if (!cv) return null;

    return {
      id: savedCV.id,
      cvId: cv.id,
      candidateName: cv.fullName || cv.user?.fullName || 'Chưa cập nhật',
      title: cv.title || 'Chưa đặt tên',
      summary: cv.summary || '',
      notes: savedCV.notes,
    };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CV đã lưu</h1>
          <p className="text-base text-gray-600">
            Quản lý danh sách CV ứng viên tiềm năng đã lưu
          </p>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo tên, vị trí, kỹ năng, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1"
            size="large"
          />
          <div className="flex items-center gap-2 text-base text-gray-600">
            <FileTextOutlined className="text-lg" />
            <span>
              <strong>{total}</strong> CV đã lưu
            </span>
          </div>
        </div>

        {/* CV Grid */}
        {isLoading ? (
          <Card className="glassmorphism">
            <div className="p-12 text-center">
              <Spin size="large" className="mb-4" />
              <p className="text-base text-gray-600">Đang tải danh sách CV đã lưu...</p>
            </div>
          </Card>
        ) : filteredCVs.length === 0 ? (
          <Card className="glassmorphism">
            <div className="p-12 text-center">
              <BookOutlined className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy CV phù hợp' : 'Chưa có CV nào được lưu'}
              </h3>
              <p className="text-base text-gray-600 mb-4">
                {searchTerm
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Lưu các CV ứng viên tiềm năng từ trang tìm ứng viên'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/recruiter/candidates')}>
                  Tìm ứng viên
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCVs.map((savedCV) => {
              const cardData = savedCVToCardData(savedCV);
              if (!cardData) return null;

              return (
                <CVCard
                  key={savedCV.id}
                  data={cardData}
                  showNotes
                  onEditNotes={() => openEditNotesModal(savedCV)}
                  onUnsave={() => setDeleteConfirm({ open: true, savedCV })}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              size="small"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <Button
              size="small"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      <Modal
        open={editNotesModal.open}
        onCancel={() => setEditNotesModal({ open: false, savedCV: null })}
        title="Sửa ghi chú"
        footer={[
          <Button key="cancel" onClick={() => setEditNotesModal({ open: false, savedCV: null })}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleUpdateNotes} loading={isUpdatingNotes}>
            Lưu
          </Button>,
        ]}
        width={500}
      >
        <p className="text-sm text-gray-600 mb-4">
          Cập nhật ghi chú cho CV của{' '}
          <strong>
            {editNotesModal.savedCV?.cv?.fullName ||
              editNotesModal.savedCV?.cv?.user?.fullName ||
              'ứng viên'}
          </strong>
        </p>
        <Input.TextArea
          placeholder="Nhập ghi chú về ứng viên này..."
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          rows={4}
        />
      </Modal>

      {/* Delete Confirm Dialog */}
      <Modal
        open={deleteConfirm.open}
        onCancel={() => setDeleteConfirm({ open: false, savedCV: null })}
        title="Bỏ lưu CV?"
        footer={[
          <Button key="cancel" onClick={() => setDeleteConfirm({ open: false, savedCV: null })}>
            Hủy
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleUnsaveCV}
            loading={isDeleting}
          >
            Bỏ lưu
          </Button>,
        ]}
        width={500}
      >
        <p className="text-base text-gray-600">
          CV của{' '}
          <strong>
            {deleteConfirm.savedCV?.cv?.fullName ||
              deleteConfirm.savedCV?.cv?.user?.fullName ||
              'ứng viên'}
          </strong>{' '}
          sẽ bị xóa khỏi danh sách đã lưu. Bạn có thể lưu lại sau.
        </p>
      </Modal>
    </div>
  );
}


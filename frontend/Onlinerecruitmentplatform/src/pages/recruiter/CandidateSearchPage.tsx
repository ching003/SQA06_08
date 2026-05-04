import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, CloseOutlined, BookOutlined } from '@ant-design/icons';
import { cvService } from '../../api/services';
import { toast } from 'sonner';
import { CVCard, CVCardData } from '../../components/recruiter/CVCard';

export function CandidateSearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedCVs, setSavedCVs] = useState<Set<string>>(new Set());
  const [savingCVs, setSavingCVs] = useState<Set<string>>(new Set());
  const [cvs, setCvs] = useState<CVCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterInputs, setFilterInputs] = useState({
    skills: '',
    location: '',
    experienceYears: '',
  });
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    experienceYears: '',
  });

  // Modal state for saving CV with notes
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch CVs that are open for job
  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true);
        const response = await cvService.searchCVs({
          isOpenForJob: true,
          page: currentPage,
          limit: itemsPerPage,
          query: searchTerm || undefined,
          skills: filters.skills || undefined,
          location: filters.location || undefined,
        });

        const cvList = Array.isArray(response.items) ? response.items : [];

        // Transform CV data to simple display format
        const cvDisplays: CVCardData[] = cvList.map(cv => ({
          id: cv.id,
          candidateName: cv.fullName || cv.user?.fullName || 'Chưa cập nhật',
          title: cv.title || 'Chưa đặt tên',
          summary: cv.summary || '',
        }));

        setCvs(cvDisplays);
        setTotal(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (error: any) {
        console.error('Failed to fetch CVs:', error);
        toast.error(error?.message || 'Không thể tải danh sách ứng viên');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, [currentPage, searchTerm, filters]);

  // Fetch saved CVs to know which are already saved
  useEffect(() => {
    const fetchSavedCVs = async () => {
      try {
        const response = await cvService.getSavedCVs({ page: 1, limit: 100 });
        const savedIds = new Set(response.items.map(item => item.cvId));
        setSavedCVs(savedIds);
      } catch (error) {
        console.error('Failed to fetch saved CVs:', error);
      }
    };
    fetchSavedCVs();
  }, []);

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setFilters(filterInputs);
    setCurrentPage(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterInputs({ skills: '', location: '', experienceYears: '' });
    setFilters({ skills: '', location: '', experienceYears: '' });
    setCurrentPage(1);
  };

  // Handle click on save button
  const handleSaveClick = (cvId: string) => {
    if (savingCVs.has(cvId)) return;

    if (savedCVs.has(cvId)) {
      // Unsave directly
      handleUnsaveCV(cvId);
    } else {
      // Open modal to add notes
      setSelectedCvId(cvId);
      setNotes('');
      setSaveModalOpen(true);
    }
  };

  // Unsave CV
  const handleUnsaveCV = async (cvId: string) => {
    setSavingCVs(prev => new Set(prev).add(cvId));
    
    try {
      await cvService.unsaveCV(cvId);
      setSavedCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
      toast.success('Đã bỏ lưu CV');
    } catch (error: any) {
      console.error('Failed to unsave CV:', error);
      toast.error(error?.message || 'Không thể bỏ lưu CV');
    } finally {
      setSavingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  // Save CV with notes (from modal)
  const handleSaveCVWithNotes = async () => {
    if (!selectedCvId || isSaving) return;

    setIsSaving(true);
    setSavingCVs(prev => new Set(prev).add(selectedCvId));
    
    try {
      await cvService.saveCV(selectedCvId, notes || undefined);
      setSavedCVs(prev => new Set(prev).add(selectedCvId));
      setSaveModalOpen(false);
      toast.success('Đã lưu CV');
    } catch (error: any) {
      console.error('Failed to save CV:', error);
      toast.error(error?.message || 'Không thể lưu CV');
    } finally {
      setIsSaving(false);
      setSavingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedCvId);
        return newSet;
      });
    }
  };

  const filteredCVs = cvs.filter(cv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return cv.candidateName.toLowerCase().includes(search) ||
      cv.title.toLowerCase().includes(search) ||
      (cv.summary && cv.summary.toLowerCase().includes(search));
  });

  // Get candidate name for modal
  const selectedCV = cvs.find(cv => cv.id === selectedCvId);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tìm ứng viên</h1>
        <p className="text-gray-600">
          Tìm kiếm ứng viên phù hợp với nhu cầu tuyển dụng
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            placeholder="Tìm theo tên, CV, giới thiệu..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1 max-w-md"
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Bộ lọc
          </Button>
          <div className="text-base text-gray-600 flex items-center gap-1">
            {isLoading ? 'Đang tải...' : (
              <>
                <span>Tìm thấy</span>
                <strong>{total}</strong>
                <span>ứng viên</span>
              </>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="glassmorphism" styles={{ body: { padding: '24px' } }}>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kỹ năng</label>
                <Input
                  placeholder="Ví dụ: React, Node.js"
                  value={filterInputs.skills}
                  onChange={(e) => setFilterInputs({ ...filterInputs, skills: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Địa điểm</label>
                <Input
                  placeholder="Ví dụ: Hà Nội"
                  value={filterInputs.location}
                  onChange={(e) => setFilterInputs({ ...filterInputs, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Số năm kinh nghiệm</label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 3"
                  value={filterInputs.experienceYears}
                  onChange={(e) => setFilterInputs({ ...filterInputs, experienceYears: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="primary"
                onClick={handleApplyFilters}
              >
                Áp dụng
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* CV Grid */}
      {isLoading ? (
        <Card className="glassmorphism">
          <div className="p-12 text-center">
            <Spin size="large" className="mb-4" />
            <p className="text-base text-gray-600">Đang tải danh sách ứng viên...</p>
          </div>
        </Card>
      ) : filteredCVs.length === 0 ? (
        <Card className="glassmorphism">
          <div className="p-12 text-center">
            <SearchOutlined className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-base text-gray-600 mb-4">
              {searchTerm ? 'Không tìm thấy ứng viên phù hợp' : 'Chưa có ứng viên nào'}
            </p>
            {searchTerm && (
              <Button onClick={handleClearSearch}>
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCVs.map(cv => (
            <CVCard
              key={cv.id}
              data={cv}
              isSaved={savedCVs.has(cv.id)}
              isSaving={savingCVs.has(cv.id)}
              onToggleSave={handleSaveClick}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredCVs.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            size="small"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  type={currentPage === pageNum ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            size="small"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>

          <span className="text-sm text-gray-600 ml-2">
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Save CV Modal */}
      <Modal
        open={saveModalOpen}
        onCancel={() => setSaveModalOpen(false)}
        title={`Lưu CV - ${selectedCV?.candidateName}`}
        footer={[
          <Button key="cancel" onClick={() => setSaveModalOpen(false)} disabled={isSaving}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveCVWithNotes} loading={isSaving}>
            Lưu
          </Button>,
        ]}
        width={400}
      >
        <Input.TextArea
          placeholder="Ghi chú (không bắt buộc)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </Modal>
    </div>
  );
}

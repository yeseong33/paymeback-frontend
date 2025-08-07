import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGathering } from '../../hooks/useGathering';
import { validateGatheringTitle, validateGatheringDescription } from '../../utils/validation';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const CreateGathering = ({ isOpen, onClose, onSuccess }) => {
  const { createGathering, loading } = useGathering();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateGatheringTitle(formData.title)) {
      newErrors.title = '모임 제목을 입력해주세요. (최대 100자)';
    }
    
    if (!validateGatheringDescription(formData.description)) {
      newErrors.description = '설명은 최대 500자까지 입력 가능합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const gathering = await createGathering(formData);
      toast.success('모임이 생성되었습니다.');
      onSuccess(gathering);
      handleClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 모임 만들기">
      <form onSubmit={handleSubmit}>
        <Input
          label="모임 제목"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="예: 회식 더치페이"
          error={errors.title}
          required
        />

        <div className="form-group">
          <label className="form-label text-gray-900 dark:text-white">모임 설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="모임에 대한 간단한 설명을 입력해주세요"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white 
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
              focus:border-transparent
              transition-colors duration-200"
            rows={4}
            maxLength={500}
          />
          {errors.description && (
            <div className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.description}</div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.description.length}/500
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleClose}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            취소
          </Button>
          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            className="dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            생성하기
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGathering;
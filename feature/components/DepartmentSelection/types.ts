import { Department } from '@/feature/department/api/interface';

export interface DepartmentSelectionModalProps {
  isVisible: boolean;
  departments?: Department[];
  isLoading: boolean;
  selectedDepartment: Department | null;
  onSelect: (department: Department) => void;
  onClose: () => void;
  onConfirm: () => void;
}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { UpdateDisputeStatusInput, DisputeData } from '../types/admin.types';

export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<DisputeData, Error, UpdateDisputeStatusInput>({
    mutationFn: (input: UpdateDisputeStatusInput) => adminService.updateDisputeStatus(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.DISPUTES_ALL });
      if (data?._id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DISPUTE(data._id) });
      }
    },
  });
};

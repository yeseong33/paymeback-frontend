import { useGatheringStore } from '../store/gatheringStore';

export const useGathering = () => {
  const {
    gatherings,
    currentGathering,
    loading,
    error,
    createGathering,
    getGathering,
    joinGathering,
    getMyGatherings,
    createPaymentRequest,
    refreshGathering,
    clearCurrentGathering,
  } = useGatheringStore();

  return {
    gatherings,
    currentGathering,
    loading,
    error,
    createGathering,
    getGathering,
    joinGathering,
    getMyGatherings,
    createPaymentRequest,
    refreshGathering,
    clearCurrentGathering,
  };
};
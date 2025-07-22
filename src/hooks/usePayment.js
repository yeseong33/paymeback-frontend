import { useState } from 'react';
import { paymentService } from '../services/paymentService';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (gatheringId, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.processPayment(gatheringId, paymentData);
      setLoading(false);
      return response;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const getMyPaymentStatus = async (gatheringId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getMyPaymentStatus(gatheringId);
      setLoading(false);
      return response;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const getGatheringPayments = async (gatheringId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getGatheringPayments(gatheringId);
      setLoading(false);
      return response;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  return {
    loading,
    error,
    processPayment,
    getMyPaymentStatus,
    getGatheringPayments,
  };
};
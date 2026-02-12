import { calculateDistance, calculateETA, isValidLocation, generateId } from '../src/utils/helpers';
describe('Utility Functions', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two locations', () => {
      const loc1 = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
      const loc2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(559, 0); // Approximately 559 km
    });
    it('should return 0 for same location', () => {
      const loc = { latitude: 37.7749, longitude: -122.4194 };
      const distance = calculateDistance(loc, loc);
      expect(distance).toBe(0);
    });
  });
  describe('calculateETA', () => {
    it('should calculate ETA correctly', () => {
      const distance = 100; // 100 km
      const speed = 50; // 50 km/h
      const eta = calculateETA(distance, speed);
      const now = new Date();
      const expectedDelay = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      expect(eta.getTime()).toBeGreaterThan(now.getTime());
      expect(eta.getTime() - now.getTime()).toBeCloseTo(expectedDelay, -3);
    });
  });
  describe('isValidLocation', () => {
    it('should validate correct coordinates', () => {
      expect(isValidLocation({ latitude: 37.7749, longitude: -122.4194 })).toBe(true);
      expect(isValidLocation({ latitude: 0, longitude: 0 })).toBe(true);
      expect(isValidLocation({ latitude: -90, longitude: -180 })).toBe(true);
      expect(isValidLocation({ latitude: 90, longitude: 180 })).toBe(true);
    });
    it('should reject invalid coordinates', () => {
      expect(isValidLocation({ latitude: 91, longitude: 0 })).toBe(false);
      expect(isValidLocation({ latitude: -91, longitude: 0 })).toBe(false);
      expect(isValidLocation({ latitude: 0, longitude: 181 })).toBe(false);
      expect(isValidLocation({ latitude: 0, longitude: -181 })).toBe(false);
    });
  });
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test_');
      const id2 = generateId('test_');
      expect(id1).not.toBe(id2);
      expect(id1).toContain('test_');
      expect(id2).toContain('test_');
    });
    it('should generate ID without prefix', () => {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });
  });
});

import { createContext, useContext, useMemo, useState } from "react";

const TripContext = createContext(null);

const initialForm = {
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  interests: [],
  travelStyle: "budget"
};

export function TripProvider({ children }) {
  const [tripForm, setTripForm] = useState(initialForm);
  const updateForm = (patch) => setTripForm((prev) => ({ ...prev, ...patch }));
  const resetForm = () => setTripForm(initialForm);
  const value = useMemo(() => ({ tripForm, updateForm, resetForm }), [tripForm]);
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripForm() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripForm must be used inside TripProvider");
  return ctx;
}

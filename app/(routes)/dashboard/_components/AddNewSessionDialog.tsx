"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import DoctorAgentCard, { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { notExists } from "drizzle-orm";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>();
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();

  const onClickNext = async () => {
    setLoading(true);
    const result = await axios.post("/api/suggest-doctors", {
      notes: note,
    });

    console.log(result.data, "data");
    setSuggestedDoctors(Array.isArray(result.data) ? result.data : []);
    setLoading(false);
  };

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      // save all info to database
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      });
      console.log(result.data, "data");
      if (result.data?.sessionId) {
        console.log(result.data.sessionId);
      }
    } catch (error) {
      console.error("Error starting consultation:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3">+ Start a Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
        </DialogHeader>

        {!suggestedDoctors ? (
          <div>
            <h2>Add Symptoms or Any Other Detail</h2>
            <Textarea
              placeholder="Add Detail here..."
              className="h-[200px] mt-1"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <h2>Select the doctor</h2>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {/* suggested doctors */}
              {suggestedDoctors.map((doctor) => (
                <SuggestedDoctorCard
                  doctorAgent={doctor}
                  key={doctor.id}
                  setSelectedDoctor={setSelectedDoctor}
                  selectedDoctor={selectedDoctor}
                />
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          {!suggestedDoctors ? (
            <Button disabled={!note || loading} onClick={() => onClickNext()}>
              Next{" "}
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={() => onStartConsultation()}
            >
              Start Consultation
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;

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

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent>();

  const onClickNext = async () => {
    setLoading(true);
    const result = await axios.post("/api/suggest-doctors", {
      notes: note,
    });

    console.log(result.data, "data");
    setSuggestedDoctors(result.data);
    setLoading(false);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3">+ Start a Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription asChild>
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
                  {suggestedDoctors.map((doctor, index) => (
                    <SuggestedDoctorCard doctorAgent={doctor} key={index} />
                  ))}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
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
            <Button>Start Consultation</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;

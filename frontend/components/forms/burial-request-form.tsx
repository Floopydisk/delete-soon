"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerWithPresets } from "@/components/ui/date-picker";
import { generateFormId } from "@/lib/notification-service";
import { User, Heart, Church, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-url";

const formSchema = z.object({
  fullNameOfDeceased: z.string().min(1, "Full name of deceased is required"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  dateOfDeath: z.date({ required_error: "Date of death is required" }),
  ageAtTimeOfDeath: z.string().min(1, "Age at time of death is required"),
  causeOfDeath: z.string().min(1, "Cause of death is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  churchInvolvement: z.string().min(1, "Church involvement is required"),
  serviceOfSongsDate: z.date().optional(),
  serviceOfSongsVenue: z.string().optional(),
  funeralServiceDate: z.date().optional(),
  funeralServiceVenue: z.string().optional(),
  zonalCoordinator: z.string().min(1, "Zonal coordinator is required"),
  zone: z.string().min(1, "Zone is required"),
  region: z.string().min(1, "Region is required"),
  regionalPastor: z.string().min(1, "Regional pastor is required"),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const maritalStatuses = [
  "Single",
  "Married",
  "Separated",
  "Divorced",
  "Widowed",
];

const churchInvolvementOptions = [
  "Conduct Service of Songs",
  "Conduct Funeral Service and Internment",
  "Conduct Both",
  "None of the Above",
];

export function BurialRequestForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    try {
      const formId = generateFormId("burial");
      const backendUrl = getApiUrl();
      const response = await fetch(
        `${backendUrl}/api/forms/burial-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, formId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.errors) {
          errorData.errors.forEach((error: any) => {
            setError(error.path, { message: error.message });
          });
        } else {
          throw new Error(`Failed to save form: ${response.status}`);
        }
      } else {
        toast({
          title: "Burial Request Submitted",
          description: "Your request has been submitted successfully.",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission notice",
        description:
          "Form submitted, but there was an issue sending notifications or saving your form. The admin team has been alerted.",
        variant: "destructive",
      });
    }
  };

  const onError = (errors: any) => {
    console.error("Form errors:", errors);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Bio-Data of the Deceased
          </CardTitle>
          <CardDescription>
            Please provide accurate information about the deceased
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullNameOfDeceased">
                Full Name of Deceased *
              </Label>
              <Input
                id="fullNameOfDeceased"
                {...register("fullNameOfDeceased")}
              />
              {errors.fullNameOfDeceased && (
                <p className="text-red-500">
                  {errors.fullNameOfDeceased.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePickerWithPresets
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date of Death *</Label>
              <Controller
                name="dateOfDeath"
                control={control}
                render={({ field }) => (
                  <DatePickerWithPresets
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
              {errors.dateOfDeath && (
                <p className="text-red-500">{errors.dateOfDeath.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageAtTimeOfDeath">Age at Time of Death *</Label>
              <Input id="ageAtTimeOfDeath" {...register("ageAtTimeOfDeath")} />
              {errors.ageAtTimeOfDeath && (
                <p className="text-red-500">
                  {errors.ageAtTimeOfDeath.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="causeOfDeath">Cause of Death *</Label>
              <Input id="causeOfDeath" {...register("causeOfDeath")} />
              {errors.causeOfDeath && (
                <p className="text-red-500">{errors.causeOfDeath.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status *</Label>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.maritalStatus && (
                <p className="text-red-500">{errors.maritalStatus.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Church className="h-5 w-5 text-purple-600" />
            Church's Involvement
          </CardTitle>
          <CardDescription>
            Let us know how you would like the church to participate in the
            funeral service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="churchInvolvement">
              How would you like the church to be involved? *
            </Label>
            <Controller
              name="churchInvolvement"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                  <SelectContent>
                    {churchInvolvementOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.churchInvolvement && (
              <p className="text-red-500">{errors.churchInvolvement.message}</p>
            )}
          </div>
          <div className="border-t pt-6 mt-2">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-purple-600" />
              Proposed Event Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Service of Songs Date</Label>
                <Controller
                  name="serviceOfSongsDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithPresets
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceOfSongsVenue">Venue</Label>
                <Input
                  id="serviceOfSongsVenue"
                  {...register("serviceOfSongsVenue")}
                />
              </div>
              <div className="space-y-2">
                <Label>Funeral Service and Internment Date</Label>
                <Controller
                  name="funeralServiceDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithPresets
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funeralServiceVenue">Venue</Label>
                <Input
                  id="funeralServiceVenue"
                  {...register("funeralServiceVenue")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-green-600" />
            Small Group Segment
          </CardTitle>
          <CardDescription>
            Provide information about your church zone and regional leadership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zonalCoordinator">
                Name of Zonal Coordinator *
              </Label>
              <Input id="zonalCoordinator" {...register("zonalCoordinator")} />
              {errors.zonalCoordinator && (
                <p className="text-red-500">
                  {errors.zonalCoordinator.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Zone *</Label>
              <Input id="zone" {...register("zone")} />
              {errors.zone && (
                <p className="text-red-500">{errors.zone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input id="region" {...register("region")} />
              {errors.region && (
                <p className="text-red-500">{errors.region.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="regionalPastor">Regional Pastor *</Label>
              <Input id="regionalPastor" {...register("regionalPastor")} />
              {errors.regionalPastor && (
                <p className="text-red-500">{errors.regionalPastor.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="remarks" className="text-base font-semibold">
              Additional Remarks
            </Label>
            <Textarea
              id="remarks"
              {...register("remarks")}
              rows={4}
              placeholder="Any additional information you would like to share..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="min-w-24"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-32 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </div>
    </form>
  );
}

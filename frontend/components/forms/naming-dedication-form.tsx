"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type React from "react";
import { useEffect, useState } from "react";
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
import { Plus, Minus, Users, Baby, Church, Calendar } from "lucide-react";
import { generateFormId } from "@/lib/notification-service";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-url";

const formSchema = z.object({
  fatherName: z.string().min(1, "Full name is required"),
  fatherPhone: z.string().min(1, "Father phone is required"),
  motherName: z.string().min(1, "Full name is required"),
  motherPhone: z.string().min(1, "Mother phone is required"),
  homeAddress: z.string().min(1, "Home address is required"),
  homeTelephone: z.string().optional(),
  homeCellRegion: z.string().optional(),
  worshipCenter: z.string().min(1, "Worship center is required"),
  cellLeaderName: z.string().optional(),
  regionalPastorName: z.string().optional(),
  fatherMembershipLevel: z.string().optional(),
  motherMembershipLevel: z.string().optional(),
  fatherIsMember: z.boolean().optional(),
  motherIsMember: z.boolean().optional(),
  fatherDaystarMember: z.string().optional(),
  motherDaystarMember: z.string().optional(),
  babies: z
    .array(
      z.object({
        name: z.string().min(1, "Baby name is required"),
        dateOfBirth: z.date({ required_error: "Date of birth is required" }),
        sex: z.string().min(1, "Sex is required"),
      }),
    )
    .min(1, "At least one baby is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  isTwins: z.boolean().optional(),
  ceremonyType: z.string().min(1, "Ceremony type is required"),
  intendedNamingDate: z.date().optional(),
  intendedDedicationDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ChurchZone {
  _id: string;
  zoneName: string;
}

const membershipLevels = [
  "Pastor",
  "Zonal Coordinator",
  "Area Coordinator",
  "Section Leader/Head of Unit",
  "Cell Leader",
  "Assistant Cell Leader",
  "Church Attendee",
  "Member",
];

export function NamingDedicationForm() {
  const [churchZones, setChurchZones] = useState<ChurchZone[]>([]);
  const backendUrl = getApiUrl();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatherName: "",
      fatherPhone: "",
      motherName: "",
      motherPhone: "",
      homeAddress: "",
      homeTelephone: "",
      homeCellRegion: "",
      worshipCenter: "",
      cellLeaderName: "",
      regionalPastorName: "",
      fatherMembershipLevel: "",
      motherMembershipLevel: "",
      fatherIsMember: undefined,
      motherIsMember: undefined,
      fatherDaystarMember: "",
      motherDaystarMember: "",
      babies: [{ name: "", dateOfBirth: new Date(), sex: "" }],
      placeOfBirth: "",
      isTwins: undefined,
      ceremonyType: "",
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchChurchZones = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/church-zones/get-all-zones`,
        );
        if (response.ok) {
          const data = await response.json();
          setChurchZones(data.data.zones);
        } else {
          console.error("Failed to fetch church zones");
        }
      } catch (error) {
        console.error("Error fetching church zones:", error);
      }
    };

    fetchChurchZones();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "babies",
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formId = generateFormId("naming");
      const response = await fetch(
        `${backendUrl}/api/forms/naming-dedication`,
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
          title: "Form submitted",
          description:
            "The relevant pastors and coordinators have been notified.",
        });
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description:
          error.message || "The form could not be submitted. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onError = () => {
    toast({
      title: "Check the form",
      description: "Please complete the highlighted fields before submitting.",
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Parents Information */}
      <Card>
        <CardHeader>
          <CardTitle>Parents Information</CardTitle>
          <CardDescription>
            Please provide both parents' details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-foreground text-base">
                Father's Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Full Name *</Label>
                <Input id="fatherName" {...register("fatherName")} />
                {errors.fatherName && (
                  <p className="text-red-500">{errors.fatherName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhone">Mobile Number *</Label>
                <Input
                  id="fatherPhone"
                  type="tel"
                  {...register("fatherPhone")}
                />
                {errors.fatherPhone && (
                  <p className="text-red-500">{errors.fatherPhone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherMembershipLevel">Leadership Level</Label>
                <Controller
                  name="fatherMembershipLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherIsMember">Is a Member of DCC</Label>
                <Controller
                  name="fatherIsMember"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={
                        field.value === undefined ? "" : String(field.value)
                      }
                    >
                      <SelectTrigger id="fatherIsMember">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherDaystarMember">
                  Are you a member of Daystar Leadership Academy?
                </Label>
                <Controller
                  name="fatherDaystarMember"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="fatherDaystarMember">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-foreground text-base">
                Mother's Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="motherName">Full Name *</Label>
                <Input id="motherName" {...register("motherName")} />
                {errors.motherName && (
                  <p className="text-red-500">{errors.motherName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherPhone">Mobile Number *</Label>
                <Input
                  id="motherPhone"
                  type="tel"
                  {...register("motherPhone")}
                />
                {errors.motherPhone && (
                  <p className="text-red-500">{errors.motherPhone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherMembershipLevel">Leadership Level</Label>
                <Controller
                  name="motherMembershipLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherIsMember">Is a Member of DCC</Label>
                <Controller
                  name="motherIsMember"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={
                        field.value === undefined ? "" : String(field.value)
                      }
                    >
                      <SelectTrigger id="motherIsMember">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherDaystarMember">
                  Are you a member of Daystar Leadership Academy?
                </Label>
                <Controller
                  name="motherDaystarMember"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="motherDaystarMember">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="homeAddress">Home Address *</Label>
              <Textarea id="homeAddress" {...register("homeAddress")} />
              {errors.homeAddress && (
                <p className="text-red-500">{errors.homeAddress.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeTelephone">Home Telephone Number</Label>
              <Input
                id="homeTelephone"
                type="tel"
                {...register("homeTelephone")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeCellRegion">Your Homecell Region</Label>
            <Input id="homeCellRegion" {...register("homeCellRegion")} />
          </div>
        </CardContent>
      </Card>

      {/* Church Information */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Church className="h-5 w-5 text-purple-600" />
            Church Information
          </CardTitle>
          <CardDescription>
            Worship center and leadership details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="worshipCenter">Worship Center *</Label>
              <Controller
                name="worshipCenter"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your worship center" />
                    </SelectTrigger>
                    <SelectContent>
                      {churchZones.map((zone) => (
                        <SelectItem key={zone._id} value={zone._id}>
                          {zone.zoneName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.worshipCenter && (
                <p className="text-red-500">{errors.worshipCenter.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellLeaderName">Cell Leader's name</Label>
              <Input id="cellLeaderName" {...register("cellLeaderName")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="regionalPastorName">Regional Pastor's Name</Label>
            <Input
              id="regionalPastorName"
              {...register("regionalPastorName")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Baby Information */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Baby className="h-5 w-5 text-green-600" />
            Baby Information
          </CardTitle>
          <CardDescription>Details about the child/children</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border-2 border-green-200 rounded-lg space-y-4 bg-green-50/50 shadow-sm"
            >
              <div className="flex justify-between items-center pb-2 border-b border-green-200">
                <h4 className="font-semibold text-green-800">
                  Baby {index + 1}
                </h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Name of Baby *</Label>
                <Input {...register(`babies.${index}.name` as const)} />
                {errors.babies?.[index]?.name && (
                  <p className="text-red-500">
                    {errors.babies[index].name.message}
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Controller
                    name={`babies.${index}.dateOfBirth` as const}
                    control={control}
                    render={({ field }) => (
                      <DatePickerWithPresets
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                  {errors.babies?.[index]?.dateOfBirth && (
                    <p className="text-red-500">
                      {errors.babies[index].dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Sex of Baby *</Label>
                  <Controller
                    name={`babies.${index}.sex` as const}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.babies?.[index]?.sex && (
                    <p className="text-red-500">
                      {errors.babies[index].sex.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ name: "", dateOfBirth: new Date(), sex: "" })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Baby
          </Button>
          <div className="space-y-2">
            <Label htmlFor="isTwins">Are they twins or more?</Label>
            <Controller
              name="isTwins"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value === undefined ? "" : String(field.value)}
                >
                  <SelectTrigger id="isTwins">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">
              Place of Birth (City/Hospital) *
            </Label>
            <Input id="placeOfBirth" {...register("placeOfBirth")} />
            {errors.placeOfBirth && (
              <p className="text-red-500">{errors.placeOfBirth.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ceremony Details */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-amber-600" />
            Ceremony Details
          </CardTitle>
          <CardDescription>
            Choose the type of ceremony and preferred dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="ceremonyType">Ceremony Type *</Label>
            <Controller
              name="ceremonyType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ceremony type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naming">Name the child</SelectItem>
                    <SelectItem value="dedication">
                      Dedicate the child
                    </SelectItem>
                    <SelectItem value="both">
                      Both Name & Dedicate the child
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.ceremonyType && (
              <p className="text-red-500">{errors.ceremonyType.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              name="intendedNamingDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Intended Date of Naming</Label>
                  <DatePickerWithPresets
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="intendedDedicationDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Intended Date of Dedication</Label>
                  <DatePickerWithPresets
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {/* Conditional Note */}
        </CardContent>
      </Card>

      {/* Submit Button */}
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

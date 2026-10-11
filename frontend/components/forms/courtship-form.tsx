"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { getApiUrl } from "@/lib/api-url";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePickerWithPresets } from "@/components/ui/date-picker";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  Heart,
  UserCircle,
  Church,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateFormId } from "@/lib/notification-service";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const personSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    age: z.string().min(1, "Age is required"),
    bloodGroup: z.string().optional(),
    genotype: z.string().optional(),
    isDaystarMember: z.string({
      required_error: "Please select an option.",
    }),
    church: z.string().optional(),
    salvationDate: z.date().optional(),
    department: z.string().optional(),
    daystarCompleted: z.enum(["yes", "no"]).optional(),
    daystarLevel: z.string().optional(),
    baptizedHolyGhost: z.string().optional(),
    baptizedDate: z.date().optional(),
    homeAddress: z.string().min(1, "Home address is required"),
    occupation: z.string().min(1, "Occupation is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Invalid email").optional(),
    officeAddress: z.string().optional(),
    maritalConviction: z.string().optional(),
    previouslyMarried: z.enum(["yes", "no"], {
      required_error: "Please select an option.",
    }),
    previousMarriageDetails: z.string().optional(),
    recentRelationship: z.enum(["yes", "no"], {
      required_error: "Please select an option.",
    }),
    parentalConsent: z.enum(["yes", "no"], {
      required_error: "Please select an option.",
    }),
    proposedWeddingDate: z.date().optional(),
    regionalPastor: z.string().optional(),
    zonalCoordinator: z.string().optional(),
    pastorName: z.string().optional(),
    pastorChurch: z.string().optional(),
    pastorPhone: z.string().optional(),
    letterOfRecommendation: z
      .any()
      .refine(
        (file) =>
          !file || (file instanceof File && file.size <= 5 * 1024 * 1024),
        "Letter must be less than 5MB",
      )
      .refine(
        (file) =>
          !file ||
          (file instanceof File &&
            [
              "application/pdf",
              "image/jpeg",
              "image/jpg",
              "image/png",
            ].includes(file.type)),
        "Only PDF, JPG, JPEG, and PNG formats are supported",
      )
      .optional(),
    photo: z
      .any()
      .refine(
        (file) =>
          !file || (file instanceof File && file.size <= 2 * 1024 * 1024),
        "Image must be less than 2MB",
      )
      .refine(
        (file) =>
          !file ||
          (file instanceof File &&
            ["image/jpeg", "image/jpg", "image/png"].includes(file.type)),
        "Only .jpg, .jpeg, and .png formats are supported",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isDaystarMember === "no" && !data.church) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Church name is required.",
        path: ["church"],
      });
    }
  });

const formSchema = z
  .object({
    supervisingCounselor: z.string().optional(),
    counselorPhone: z.string().optional(),
    brother: personSchema,
    sister: personSchema,
    churchZoneId: z.string().min(1, "Church zone is required"),
  })
  .superRefine((data, ctx) => {
    (["brother", "sister"] as const).forEach((person) => {
      if (data[person].isDaystarMember === "yes") {
        if (!data[person].daystarCompleted) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [person, "daystarCompleted"],
            message:
              "Please select whether Daystar Academy has been completed.",
          });
        }
        if (!data[person].daystarLevel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [person, "daystarLevel"],
            message: "Please select a Daystar Academy level.",
          });
        }
      }
    });
    if (
      data.brother.isDaystarMember === "yes" &&
      data.sister.isDaystarMember === "yes" &&
      data.brother.daystarLevel === "Yet to Attend" &&
      data.sister.daystarLevel === "Yet to Attend"
    ) {
      const message =
        "At least one applicant must have completed Daystar Academy 100 Level before this form can proceed.";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["brother", "daystarLevel"],
        message,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sister", "daystarLevel"],
        message,
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genotypes = ["AA", "AS", "SS", "AC", "SC"];
const daystarLevels = [
  "100 lvl - Membership School",
  "200lvl - Maturity School",
  "300lvl - Ministry School",
  "400lvl - Missions School",
  "Yet to Attend",
];

interface ChurchZone {
  _id: string;
  zoneName: string;
  zonalCoordinatorName?: string;
  zonalCoordinatorEmail?: string;
  regionalPastorName?: string;
  regionalPastorEmail?: string;
  // Kept while existing zone records are migrated to regional pastor fields.
  districtPastorName?: string;
  districtPastorEmail?: string;
}

export function CourtshipForm() {
  const searchParams = useSearchParams();
  const initiationToken = searchParams.get("invite") || "";
  const { toast } = useToast();
  const [churchZones, setChurchZones] = useState<ChurchZone[]>([]);
  const [invitedZone, setInvitedZone] = useState<ChurchZone | null>(null);
  const [inviteLoading, setInviteLoading] = useState(Boolean(initiationToken));
  const [inviteError, setInviteError] = useState("");
  const [guidelinesDownloaded, setGuidelinesDownloaded] = useState(false);
  const [acknowledgmentChecked, setAcknowledgmentChecked] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{
    brother?: string;
    sister?: string;
  }>({});
  const [imageErrors, setImageErrors] = useState<{
    brother?: string;
    sister?: string;
  }>({});
  const [imageUrls, setImageUrls] = useState<{
    brother?: string;
    sister?: string;
  }>({});
  const [isUploading, setIsUploading] = useState<{
    brother?: boolean;
    sister?: boolean;
  }>({});
  const [letterUrls, setLetterUrls] = useState<{
    brother?: string;
    sister?: string;
  }>({});
  const [letterErrors, setLetterErrors] = useState<{
    brother?: string;
    sister?: string;
  }>({});
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brother: { name: "" },
      sister: { name: "" },
    },
  });
  const selectedChurchZoneId = watch("churchZoneId");
  const selectedChurchZone =
    invitedZone ||
    churchZones.find((zone) => zone._id === selectedChurchZoneId);
  const zonalCoordinatorName = selectedChurchZone?.zonalCoordinatorName;
  const regionalPastorName =
    selectedChurchZone?.regionalPastorName ||
    selectedChurchZone?.districtPastorName;

  useEffect(() => {
    if (!initiationToken) return;

    const fetchInitiation = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/api/forms/courtship/initiation/${initiationToken}`,
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "This form link is no longer available.",
          );
        }
        setInvitedZone(data.data.zone);
        setValue("churchZoneId", data.data.zone._id, { shouldValidate: true });
      } catch (error: any) {
        setInviteError(
          error.message || "This form link is no longer available.",
        );
      } finally {
        setInviteLoading(false);
      }
    };

    fetchInitiation();
  }, [initiationToken, setValue]);

  // Function to convert File to base64 for preview only
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to handle image selection and preview
  const handleImageChange = async (
    file: File | null,
    person: "brother" | "sister",
  ) => {
    // Clear previous error
    setImageErrors((prev) => ({ ...prev, [person]: undefined }));

    // Clear preview if no file
    if (!file) {
      setImagePreviews((prev) => ({ ...prev, [person]: undefined }));
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setImageErrors((prev) => ({
        ...prev,
        [person]: "Only .jpg, .jpeg, and .png formats are supported",
      }));
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setImageErrors((prev) => ({
        ...prev,
        [person]: "Image must be less than 2MB",
      }));
      return;
    }

    try {
      // Generate preview
      const base64 = await fileToBase64(file);
      setImagePreviews((prev) => ({ ...prev, [person]: base64 }));
    } catch (error) {
      console.error("Error creating image preview:", error);
      setImageErrors((prev) => ({
        ...prev,
        [person]: "Failed to process image",
      }));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!initiationToken) {
      toast({
        title: "Coordinator initiation required",
        description: "Please use the form link sent by your Zonal Coordinator.",
        variant: "destructive",
      });
      return;
    }
    console.log("Form data:", data);
    try {
      const formId = generateFormId("courtship");

      // Process images if they exist
      let brotherPhotoUrl = imageUrls.brother;
      let sisterPhotoUrl = imageUrls.sister;

      // Upload brother's photo to S3 if it exists and hasn't been uploaded yet
      if (data.brother.photo instanceof File && !brotherPhotoUrl) {
        try {
          setIsUploading((prev) => ({ ...prev, brother: true }));
          console.log(
            "Uploading brother's photo:",
            data.brother.photo.name,
            data.brother.photo.type,
            data.brother.photo.size,
          );
          brotherPhotoUrl = await uploadImageToS3(
            data.brother.photo,
            "courtship-photos/brother",
          );
          console.log("Brother photo upload successful, URL:", brotherPhotoUrl);
          setImageUrls((prev) => ({ ...prev, brother: brotherPhotoUrl }));
        } catch (error: any) {
          console.error("Error uploading brother's photo to S3:", error);
          const errorMessage =
            error.message || "Failed to upload image. Please try again.";
          setImageErrors((prev) => ({
            ...prev,
            brother: errorMessage,
          }));

          // Show a toast with error details
          toast({
            title: "Photo Upload Failed",
            description: `Brother's photo upload failed: ${errorMessage}`,
            variant: "destructive",
          });

          setIsUploading((prev) => ({ ...prev, brother: false }));
          return; // Stop submission if image upload fails
        } finally {
          setIsUploading((prev) => ({ ...prev, brother: false }));
        }
      }

      // Upload sister's photo to S3 if it exists and hasn't been uploaded yet
      if (data.sister.photo instanceof File && !sisterPhotoUrl) {
        try {
          setIsUploading((prev) => ({ ...prev, sister: true }));
          console.log(
            "Uploading sister's photo:",
            data.sister.photo.name,
            data.sister.photo.type,
            data.sister.photo.size,
          );
          sisterPhotoUrl = await uploadImageToS3(
            data.sister.photo,
            "courtship-photos/sister",
          );
          console.log("Sister photo upload successful, URL:", sisterPhotoUrl);
          setImageUrls((prev) => ({ ...prev, sister: sisterPhotoUrl }));
        } catch (error: any) {
          console.error("Error uploading sister's photo to S3:", error);
          const errorMessage =
            error.message || "Failed to upload image. Please try again.";
          setImageErrors((prev) => ({
            ...prev,
            sister: errorMessage,
          }));

          // Show a toast with error details
          toast({
            title: "Photo Upload Failed",
            description: `Sister's photo upload failed: ${errorMessage}`,
            variant: "destructive",
          });

          setIsUploading((prev) => ({ ...prev, sister: false }));
          return; // Stop submission if image upload fails
        } finally {
          setIsUploading((prev) => ({ ...prev, sister: false }));
        }
      }

      // Upload brother's letter of recommendation if needed (non-Daystar members)
      let brotherLetterUrl = letterUrls.brother;
      if (
        data.brother.letterOfRecommendation instanceof File &&
        !brotherLetterUrl &&
        data.brother.isDaystarMember === "no"
      ) {
        try {
          setIsUploading((prev) => ({ ...prev, brother: true }));
          console.log(
            "Uploading brother's letter:",
            data.brother.letterOfRecommendation.name,
          );
          brotherLetterUrl = await uploadImageToS3(
            data.brother.letterOfRecommendation,
            "courtship-letters/brother",
          );
          console.log(
            "Brother letter upload successful, URL:",
            brotherLetterUrl,
          );
          setLetterUrls((prev) => ({ ...prev, brother: brotherLetterUrl }));
        } catch (error: any) {
          console.error("Error uploading brother's letter to S3:", error);
          const errorMessage =
            error.message || "Failed to upload letter. Please try again.";
          setLetterErrors((prev) => ({
            ...prev,
            brother: errorMessage,
          }));

          toast({
            title: "Letter Upload Failed",
            description: `Brother's letter upload failed: ${errorMessage}`,
            variant: "destructive",
          });

          setIsUploading((prev) => ({ ...prev, brother: false }));
          return;
        } finally {
          setIsUploading((prev) => ({ ...prev, brother: false }));
        }
      }

      // Upload sister's letter of recommendation if needed (non-Daystar members)
      let sisterLetterUrl = letterUrls.sister;
      if (
        data.sister.letterOfRecommendation instanceof File &&
        !sisterLetterUrl &&
        data.sister.isDaystarMember === "no"
      ) {
        try {
          setIsUploading((prev) => ({ ...prev, sister: true }));
          console.log(
            "Uploading sister's letter:",
            data.sister.letterOfRecommendation.name,
          );
          sisterLetterUrl = await uploadImageToS3(
            data.sister.letterOfRecommendation,
            "courtship-letters/sister",
          );
          console.log("Sister letter upload successful, URL:", sisterLetterUrl);
          setLetterUrls((prev) => ({ ...prev, sister: sisterLetterUrl }));
        } catch (error: any) {
          console.error("Error uploading sister's letter to S3:", error);
          const errorMessage =
            error.message || "Failed to upload letter. Please try again.";
          setLetterErrors((prev) => ({
            ...prev,
            sister: errorMessage,
          }));

          toast({
            title: "Letter Upload Failed",
            description: `Sister's letter upload failed: ${errorMessage}`,
            variant: "destructive",
          });

          setIsUploading((prev) => ({ ...prev, sister: false }));
          return;
        } finally {
          setIsUploading((prev) => ({ ...prev, sister: false }));
        }
      }

      const fieldMapping: Record<string, string> = {
        dateOfBirth: "Dob",
        isDaystarMember: "IsDaystarMember",
        salvationDate: "SalvationDate",
        daystarCompleted: "DaystarCompleted",
        daystarLevel: "DaystarLevel",
        baptizedHolyGhost: "BaptizedHolyGhost",
        baptizedDate: "BaptizedDate",
        homeAddress: "HomeAddress",
        officeAddress: "OfficeAddress",
        maritalConviction: "MaritalConviction",
        previouslyMarried: "PreviouslyMarried",
        previousMarriageDetails: "PreviousMarriageDetails",
        recentRelationship: "RecentRelationship",
        parentalConsent: "ParentalConsent",
        proposedWeddingDate: "ProposedWeddingDate",
        regionalPastor: "RegionalPastor",
        zonalCoordinator: "ZonalCoordinator",
        pastorName: "PastorName",
        pastorChurch: "PastorChurch",
        pastorPhone: "PastorPhone",
        letterOfRecommendation: "LetterOfRecommendation",
        // Add photo field to mapping
        photo: "Photo",
      };

      const transformPersonData = (
        personData: any,
        prefix: string,
        photoUrl?: string | null,
        letterUrl?: string | null,
      ) => {
        const transformed: Record<string, any> = {};
        for (const key in personData) {
          // Skip the original photo and letter File objects
          if (key === "photo" || key === "letterOfRecommendation") continue;

          const mappedKey =
            fieldMapping[key] || key.charAt(0).toUpperCase() + key.slice(1);
          transformed[`${prefix}${mappedKey}`] = personData[key];
        }

        // Add photo URL if available
        if (photoUrl) {
          transformed[`${prefix}PhotoUrl`] = photoUrl;
        }

        // Add letter URL if available
        if (letterUrl) {
          transformed[`${prefix}LetterOfRecommendationUrl`] = letterUrl;
        }

        return transformed;
      };

      const backendData = {
        supervisingCounselor: data.supervisingCounselor,
        counselorPhone: data.counselorPhone,
        churchZoneId: data.churchZoneId,
        initiationToken,
        ...transformPersonData(
          data.brother,
          "brother",
          brotherPhotoUrl,
          brotherLetterUrl,
        ),
        ...transformPersonData(
          data.sister,
          "sister",
          sisterPhotoUrl,
          sisterLetterUrl,
        ),
        formId,
      };

      console.log("Submitting data:", backendData);

      const response = await fetch(
        `${getApiUrl()}/api/forms/courtship`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.errors) {
          errorData.errors.forEach((error: any) => {
            setError(error.path, { message: error.message });
          });
          toast({
            title: "Form Validation Error",
            description: "Please check the form for errors and try again.",
            variant: "destructive",
          });
        } else {
          throw new Error(`Failed to save form: ${response.status}`);
        }
      } else {
        toast({
          title: "Success!",
          description:
            "Courtship form submitted successfully. Your Zonal Coordinator and Regional Pastor have been notified automatically.",
          variant: "default",
        });

        // Redirect to thank you page after successful submission
        window.location.href = "/forms/thank-you";
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description:
          error.message ||
          "There was an issue saving your form. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const onError = (errors: any) => {
    console.error("Form errors:", errors);
    toast({
      title: "Check the form",
      description: "Please complete the highlighted fields before submitting.",
      variant: "destructive",
    });
  };

  const handleDownloadGuidelines = () => {
    const link = document.createElement("a");
    link.href = "/docs/Daystar_Courtship_Guidline.pdf";
    link.download = "Daystar_Courtship_Guidelines.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setGuidelinesDownloaded(true);
  };

  const PersonSection = ({
    person,
    title,
  }: {
    person: "brother" | "sister";
    title: string;
  }) => {
    const isDaystarMember = watch(`${person}.isDaystarMember`);
    return (
      <Card className="border border-border shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-semibold text-foreground">Bio-data</h3>
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${person}Name`}>Name *</Label>
                    <Input {...register(`${person}.name`)} />
                    {errors[person]?.name && (
                      <p className="text-red-500">
                        {errors[person]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${person}Age`}>Age *</Label>
                    <Input type="number" {...register(`${person}.age`)} />
                    {errors[person]?.age && (
                      <p className="text-red-500">
                        {errors[person]?.age?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Controller
                      name={`${person}.dateOfBirth`}
                      control={control}
                      render={({ field }) => (
                        <DatePickerWithPresets
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors[person]?.dateOfBirth && (
                      <p className="text-red-500">
                        {errors[person]?.dateOfBirth?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${person}BloodGroup`}>Blood Group</Label>
                    <Controller
                      name={`${person}.bloodGroup`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${person}Genotype`}>Genotype</Label>
                    <Controller
                      name={`${person}.genotype`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {genotypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Church Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Are you a member of Daystar? *</Label>
                    <Controller
                      name={`${person}.isDaystarMember`}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" />
                            <Label>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" />
                            <Label>No</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {errors[person]?.isDaystarMember && (
                      <p className="text-red-500">
                        {errors[person]?.isDaystarMember?.message}
                      </p>
                    )}
                  </div>

                  {isDaystarMember === "no" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${person}Church`}>
                        Name of Church *
                      </Label>
                      <Input {...register(`${person}.church`)} />
                      {errors[person]?.church && (
                        <p className="text-red-500">
                          {errors[person]?.church?.message}
                        </p>
                      )}
                    </div>
                  )}
                  {isDaystarMember === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${person}Department`}>Dept./Unit</Label>
                      <Input {...register(`${person}.department`)} />
                    </div>
                  )}
                </div>

                {/* Daystar-specific fields - only for Daystar members */}
                {isDaystarMember === "yes" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Salvation</Label>
                        <Controller
                          name={`${person}.salvationDate`}
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
                        <Label>
                          Have you completed Daystar Academy (100 Level -
                          Membership School)?
                        </Label>
                        <Controller
                          name={`${person}.daystarCompleted`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors[person]?.daystarCompleted && (
                          <p className="text-red-500">
                            {errors[person]?.daystarCompleted?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${person}DaystarLevel`}>
                        Daystar Academy Level
                      </Label>
                      <Controller
                        name={`${person}.daystarLevel`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {daystarLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors[person]?.daystarLevel && (
                        <p className="text-red-500">
                          {errors[person]?.daystarLevel?.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Non-Daystar members: Date of Salvation only */}
                {isDaystarMember === "no" && (
                  <div className="space-y-2">
                    <Label>Date of Salvation</Label>
                    <Controller
                      name={`${person}.salvationDate`}
                      control={control}
                      render={({ field }) => (
                        <DatePickerWithPresets
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Are You Baptized in the Holy Ghost?</Label>
                    <Controller
                      name={`${person}.baptizedHolyGhost`}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" />
                            <Label>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" />
                            <Label>No</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <Controller
                    name={`${person}.baptizedDate`}
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>If Yes, When?</Label>
                        <DatePickerWithPresets
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${person}Phone`}>Tel *</Label>
                    <Input type="tel" {...register(`${person}.phone`)} />
                    {errors[person]?.phone && (
                      <p className="text-red-500">
                        {errors[person]?.phone?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${person}Email`}>E-mail Address</Label>
                    <Input type="email" {...register(`${person}.email`)} />
                    {errors[person]?.email && (
                      <p className="text-red-500">
                        {errors[person]?.email?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${person}HomeAddress`}>Home Address *</Label>
                  <Textarea {...register(`${person}.homeAddress`)} />
                  {errors[person]?.homeAddress && (
                    <p className="text-red-500">
                      {errors[person]?.homeAddress?.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${person}Occupation`}>Occupation *</Label>
                    <Input {...register(`${person}.occupation`)} />
                    {errors[person]?.occupation && (
                      <p className="text-red-500">
                        {errors[person]?.occupation?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${person}OfficeAddress`}>
                      Office Address
                    </Label>
                    <Textarea {...register(`${person}.officeAddress`)} />
                  </div>
                </div>

                {/* Personal Questions */}
                <div className="space-y-2">
                  <Label htmlFor={`${person}MaritalConviction`}>
                    Brief Testimony of Marital Conviction
                  </Label>
                  <Textarea
                    {...register(`${person}.maritalConviction`)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Have you ever been married? *</Label>
                    <Controller
                      name={`${person}.previouslyMarried`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
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

                  <Controller
                    name={`${person}.previousMarriageDetails`}
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>If yes, give details</Label>
                        <Textarea {...field} />
                      </div>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>
                      Have you been in any other relationship in the last 6
                      months? *
                    </Label>
                    <Controller
                      name={`${person}.recentRelationship`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
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
                    <Label>
                      Do you have parental consent for this relationship? *
                    </Label>
                    <Controller
                      name={`${person}.parentalConsent`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
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

                {/* Wedding and Leadership Information - only for Daystar members */}
                {isDaystarMember === "yes" && (
                  <div className="border-t pt-6 space-y-4">
                    <h4 className="font-semibold text-base">
                      Wedding & Leadership Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Proposed Wedding Date</Label>
                        <Controller
                          name={`${person}.proposedWeddingDate`}
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
                        <Label htmlFor={`${person}RegionalPastor`}>
                          Regional Pastor
                        </Label>
                        <Input {...register(`${person}.regionalPastor`)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`${person}ZonalCoordinator`}>
                          Zonal Coordinator
                        </Label>
                        <Input {...register(`${person}.zonalCoordinator`)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Wedding Date and Pastor Information for non-Daystar members */}
                {isDaystarMember === "no" && (
                  <div className="border-t pt-6 space-y-4">
                    <h4 className="font-semibold text-base">
                      Wedding & Pastor Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Proposed Wedding Date</Label>
                        <Controller
                          name={`${person}.proposedWeddingDate`}
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
                        <Label htmlFor={`${person}PastorName`}>
                          Pastor's Name
                        </Label>
                        <Input
                          {...register(`${person}.pastorName`)}
                          placeholder="Your pastor's name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${person}PastorPhone`}>
                          Pastor's Phone
                        </Label>
                        <Input
                          type="tel"
                          {...register(`${person}.pastorPhone`)}
                          placeholder="Pastor's contact number"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`${person}PastorChurch`}>
                          Pastor's Church
                        </Label>
                        <Input
                          {...register(`${person}.pastorChurch`)}
                          placeholder="Name of pastor's church"
                        />
                      </div>

                      {/* Letter of Recommendation Upload */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`${person}LetterOfRecommendation`}>
                          Letter of Recommendation from Pastor *
                        </Label>
                        <div className="text-xs text-muted-foreground mb-2">
                          Upload a recommendation letter from your pastor (PDF,
                          JPG, JPEG, or PNG - Max 5MB)
                        </div>
                        <Controller
                          name={`${person}.letterOfRecommendation`}
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Input
                                id={`${person}LetterOfRecommendation`}
                                type="file"
                                accept="application/pdf,image/jpeg,image/jpg,image/png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  field.onChange(file);
                                  if (file) {
                                    setLetterUrls((prev) => ({
                                      ...prev,
                                      [person]: file.name,
                                    }));
                                    setLetterErrors((prev) => ({
                                      ...prev,
                                      [person]: undefined,
                                    }));
                                  }
                                }}
                                className="cursor-pointer"
                              />
                              {letterUrls[person as "brother" | "sister"] && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {letterUrls[person as "brother" | "sister"]}
                                </p>
                              )}
                              {letterErrors[person as "brother" | "sister"] && (
                                <Alert
                                  variant="destructive"
                                  className="py-2 mt-2"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    {
                                      letterErrors[
                                        person as "brother" | "sister"
                                      ]
                                    }
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor={`${person}Photo`}>Upload Photo</Label>
                <div
                  className={`border-2 border-dashed ${
                    imageErrors[person as "brother" | "sister"]
                      ? "border-destructive"
                      : "border-border"
                  } rounded-lg p-6 text-center relative`}
                >
                  {!imagePreviews[person as "brother" | "sister"] ? (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Controller
                        name={`${person}.photo`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            id={`${person}Photo`}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              field.onChange(file);
                              handleImageChange(
                                file,
                                person as "brother" | "sister",
                              );
                              // Reset URL when new file is selected
                              setImageUrls((prev) => ({
                                ...prev,
                                [person]: undefined,
                              }));
                            }}
                            className="hidden"
                            disabled={
                              isUploading[person as "brother" | "sister"]
                            }
                          />
                        )}
                      />
                      <Label
                        htmlFor={`${person}Photo`}
                        className={`text-sm text-foreground hover:text-foreground/80 ${
                          isUploading[person as "brother" | "sister"]
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        Click to upload photo
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formats: JPG, JPEG, PNG. Max size: 2MB
                      </p>
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreviews[person as "brother" | "sister"]}
                        alt="Preview"
                        className="w-40 h-40 object-cover mx-auto rounded-md"
                      />
                      {isUploading[person as "brother" | "sister"] ? (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                          <span className="ml-2 text-sm font-medium">
                            Uploading...
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreviews((prev) => ({
                              ...prev,
                              [person]: undefined,
                            }));
                            setImageUrls((prev) => ({
                              ...prev,
                              [person]: undefined,
                            }));
                            // Also clear the form field
                            setValue(`${person}.photo`, null);
                          }}
                          className="absolute top-0 right-0 bg-foreground rounded-full p-1 -mt-2 -mr-2"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 text-background" />
                        </button>
                      )}
                      {imageUrls[person as "brother" | "sister"] && (
                        <div className="absolute bottom-0 left-0 right-0 bg-foreground/85 text-background text-xs py-1 px-2">
                          <CheckCircle className="h-3 w-3 inline-block mr-1" />{" "}
                          Uploaded successfully
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {imageErrors[person as "brother" | "sister"] && (
                  <Alert variant="destructive" className="py-2 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {imageErrors[person as "brother" | "sister"]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    );
  };

  if (!initiationToken) {
    return (
      <Alert className="border-border bg-muted/40">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This form must be initiated by your Zonal Coordinator. Please use the
          secure form link they send to you.
        </AlertDescription>
      </Alert>
    );
  }

  if (inviteLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying your form
        link…
      </div>
    );
  }

  if (inviteError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{inviteError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-6xl mx-auto pb-8"
    >
      {/* Courtship Guidelines Section */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground text-xl">
            <FileText className="h-6 w-6" />
            Courtship Guidelines - Required Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/40 border-l-4 border-border p-4 mb-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Your cell leader must be aware
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Before proceeding with your courtship application, you must download
            and read the official Daystar Christian Centre Courtship Guidelines.
            These guidelines contain important information about our courtship
            process, requirements, and expectations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              type="button"
              onClick={handleDownloadGuidelines}
              variant={guidelinesDownloaded ? "secondary" : "outline"}
              className="flex items-center gap-2 min-w-fit"
              disabled={guidelinesDownloaded}
            >
              {guidelinesDownloaded ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Guidelines Downloaded
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Guidelines (PDF)
                </>
              )}
            </Button>

            <div className="space-y-2 flex-1">
              <Label
                htmlFor="acknowledgment"
                className={`text-sm ${
                  !guidelinesDownloaded
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground"
                }`}
              >
                I have read and understood the courtship guidelines *
              </Label>
              <Select
                value={acknowledgmentChecked ? "yes" : ""}
                onValueChange={(value) =>
                  setAcknowledgmentChecked(value === "yes")
                }
                disabled={!guidelinesDownloaded}
              >
                <SelectTrigger id="acknowledgment">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!guidelinesDownloaded && (
            <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Please download and read the guidelines before proceeding with the
              form.
            </div>
          )}

          {guidelinesDownloaded && !acknowledgmentChecked && (
            <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Guidelines downloaded. Please select "Yes" to confirm that you
              have read them.
            </div>
          )}
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem
          value="item-1"
          className="border border-border rounded-lg shadow-sm bg-card"
        >
          <AccordionTrigger className="px-4 hover:bg-muted/40">
            <span className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              Brother's Data
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <PersonSection person="brother" title="" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="item-2"
          className="border border-border rounded-lg shadow-sm bg-card"
        >
          <AccordionTrigger className="px-4 hover:bg-muted/40">
            <span className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              Sister's Data
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <PersonSection person="sister" title="" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="item-3"
          className="border border-border rounded-lg shadow-sm bg-card"
        >
          <AccordionTrigger className="px-4 hover:bg-muted/40">
            <span className="flex items-center gap-2">
              <Church className="h-5 w-5 text-muted-foreground" />
              Zone & Required Signatories{" "}
              {watch("brother.isDaystarMember") === "no" ||
              watch("sister.isDaystarMember") === "no"
                ? "(For Non-Daystar Members)"
                : ""}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="churchZoneId">Church Zone *</Label>
                  <Controller
                    name="churchZoneId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={Boolean(invitedZone)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your church zone" />
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
                  {errors.churchZoneId && (
                    <p className="text-red-500">
                      {errors.churchZoneId.message}
                    </p>
                  )}
                  {invitedZone && (
                    <p className="text-xs text-muted-foreground">
                      This zone was selected by your Zonal Coordinator.
                    </p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Zonal Coordinator</Label>
                    <Input
                      value={
                        zonalCoordinatorName || "Not configured for this zone"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Regional Pastor (required signatory)</Label>
                    <Input
                      value={
                        regionalPastorName || "Not configured for this zone"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The selected Zonal Coordinator and Regional Pastor will be
                  notified automatically when this form is submitted.
                </p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="item-4"
          className="border border-border rounded-lg shadow-sm bg-card"
        >
          <AccordionTrigger className="px-4 hover:bg-muted/40">
            <span className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              Click to expand Supervising Counselor Information
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="supervisingCounselor">
                    Supervising Counselor Assigned
                  </Label>
                  <Input {...register("supervisingCounselor")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselorPhone">Tel No</Label>
                  <Input
                    type="tel"
                    {...register("counselorPhone")}
                    className="form-input"
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Declaration Section */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              I/We hereby declare that all the information provided in this
              courtship application form is true, accurate, and complete to the
              best of my/our knowledge. I/We understand that any false
              information or omission of facts may result in the rejection of
              this application or termination of the courtship process.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I/We agree to abide by the guidelines and principles of Daystar
              Christian Centre regarding courtship and marriage. I/We commit to
              participate fully in all required counseling sessions and to
              maintain the standards of conduct expected by the church
              throughout this process.
            </p>
            <div className="bg-muted/40 border-l-4 border-border p-4 mt-4">
              <p className="text-sm font-semibold text-foreground">
                By submitting this form, you acknowledge that you have read,
                understood, and agree to the terms stated in this declaration.
              </p>
            </div>
          </div>
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
        <div className="flex flex-col items-end gap-2">
          <Button
            type="submit"
            disabled={
              isSubmitting || !guidelinesDownloaded || !acknowledgmentChecked
            }
            className="min-w-32"
          >
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </Button>
          {(!guidelinesDownloaded || !acknowledgmentChecked) && (
            <p className="text-xs text-muted-foreground text-right max-w-48">
              {!guidelinesDownloaded
                ? "Please download the guidelines to continue"
                : "Please confirm you have read the guidelines"}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

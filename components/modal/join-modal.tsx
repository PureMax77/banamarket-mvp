"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createAccount } from "@/app/(auth)/join/action";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  OnlyNumberRegex,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PhoneNumberRegex,
} from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`
    ),
  confirm_password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`
    ),
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `이름은 최소 ${NAME_MIN_LENGTH}자 이상이어야 합니다.`)
    .max(NAME_MAX_LENGTH, `이름은 최대 ${NAME_MAX_LENGTH}자 이하여야 합니다.`),
  phone: z.string().regex(PhoneNumberRegex, "유효한 전화번호를 입력해주세요."),
  adult_check: z
    .boolean()
    .refine((val) => val === true, "14세 이상임을 확인해주세요."),
  term_check: z
    .boolean()
    .refine((val) => val === true, "이용약관에 동의해주세요."),
  info_check: z
    .boolean()
    .refine((val) => val === true, "개인정보 수집 및 이용에 동의해주세요."),
  ad_check: z.boolean(),
});

export default function JoinModal() {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useFormState<any, FormData>(createAccount, {
    fieldErrors: {},
    formErrors: [],
  });
  const [phoneNumber, setPhoneNumber] = useState<string>("010");
  const [code, setCode] = useState<string>("");
  const [isPhoneSend, setIsPhoneSend] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isAllCheck, setIsAllCheck] = useState<boolean>(false);
  const [isLoadingReq, setIsLoadingReq] = useState<boolean>(false);
  const [isLoadingVery, setIsLoadingVery] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      name: "",
      phone: "010",
      adult_check: false,
      term_check: false,
      info_check: false,
      ad_check: false,
    },
  });

  const handleAllCheckbox = (checked: boolean) => {
    setIsAllCheck(checked);
    form.setValue("adult_check", checked);
    form.setValue("term_check", checked);
    form.setValue("info_check", checked);
    form.setValue("ad_check", checked);
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (OnlyNumberRegex.test(e.target.value) || e.target.value === "") {
      setPhoneNumber(e.target.value);
      form.setValue("phone", e.target.value);
    }
  };

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    if (OnlyNumberRegex.test(newCode) || newCode === "") {
      if (newCode.length <= 6) {
        setCode(newCode);
      }
    }
  };

  const onPhoneSend = async () => {
    if (!PhoneNumberRegex.test(phoneNumber)) {
      return alert("잘못된 휴대폰번호입니다.");
    }

    try {
      setIsLoadingReq(true);

      const result = await fetch("/api/sms/sendcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      if (result.status === 200) {
        if (!isPhoneSend) setIsPhoneSend(true);
        alert("인증번호를 전송했습니다.");
      } else {
        const { msg } = await result.json();
        alert(msg);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingReq(false);
    }
  };

  const onVerifyCode = async () => {
    if (code.length !== 6) {
      return alert("인증번호는 6자리입니다.");
    }

    try {
      setIsLoadingVery(true);

      const result = await fetch("/api/sms/checkcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
        }),
      });

      if (result.status === 200) {
        setIsVerified(true);
        alert("인증에 성공했습니다.");
      } else {
        const { msg } = await result.json();
        alert(msg);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingVery(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        form.reset();
        setPhoneNumber("010");
        setCode("");
        setIsAllCheck(false);
        setIsPhoneSend(false);
        setIsVerified(false);
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const watchFields = [
      "adult_check",
      "term_check",
      "info_check",
      "ad_check",
    ] as const;
    const values = form.watch(watchFields);
    setIsAllCheck(values.every((value) => value === true));
  }, [form]);

  useEffect(() => {
    if (state?.fieldErrors) {
      Object.keys(state.fieldErrors).forEach((fieldName: string) => {
        form.setError(fieldName as any, {
          type: "server",
          message: state.fieldErrors[fieldName]?.[0],
        });
      });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-neutral-500 mt-4 text-lg">
          이메일 회원가입
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>이메일 회원가입</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              const formData = new FormData();
              Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString());
              });
              dispatch(formData);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="아이디(이메일)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호(영문,숫자,특수문자 8~20자리)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호 확인"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="휴대폰(숫자만 입력)"
                        {...field}
                        value={phoneNumber}
                        onChange={onPhoneChange}
                        readOnly={isVerified}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={onPhoneSend}
                disabled={isVerified || isLoadingReq}
              >
                {isLoadingReq ? "요청중..." : "인증요청"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="인증번호(6자리)"
                value={code}
                onChange={onCodeChange}
                disabled={!isPhoneSend}
                readOnly={isVerified}
              />
              <Button
                type="button"
                onClick={onVerifyCode}
                disabled={!isPhoneSend || isVerified || isLoadingVery}
              >
                {isLoadingVery ? "인증중..." : "인증"}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-check"
                  checked={isAllCheck}
                  onCheckedChange={handleAllCheckbox}
                />
                <label htmlFor="all-check">약관 전체 동의</label>
              </div>
              <hr className="my-2" />
              <FormField
                control={form.control}
                name="adult_check"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>필수_만 14세 이상입니다.</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term_check"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        필수_이용약관 동의{" "}
                        <Link href="/" target="_blank" className="text-xs">
                          [약관 보기]
                        </Link>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="info_check"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        필수_개인정보 수집 및 이용 동의{" "}
                        <Link href="/" target="_blank" className="text-xs">
                          [약관 보기]
                        </Link>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ad_check"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        선택_광고성 정보 수신 동의{" "}
                        <Link href="/" target="_blank" className="text-xs">
                          [약관 보기]
                        </Link>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              회원가입
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

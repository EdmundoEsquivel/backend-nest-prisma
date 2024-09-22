import { Product } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from "class-transformer";

export class ProductEntity implements Product {

    constructor(partial: Partial<ProductEntity>) {
        Object.assign(this, partial);
      }

id: string;
title: string;

@Exclude()
price: number;

@Exclude()
description: string;

@Exclude()
slug: string;

@Exclude()
stock: number;

@Exclude()
sizes: string[];

@Exclude()
gender: string;

@Exclude()
tags: string[];

images: string[];


}

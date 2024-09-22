import { Product } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from "class-transformer";

export class ProductEntity implements Product {

    constructor(partial: Partial<ProductEntity>) {
        Object.assign(this, partial);
      }

@ApiProperty()
id: string;
title: string;

@ApiProperty()
@Exclude()
price: number;

@ApiProperty()
@Exclude()
description: string;

@ApiProperty()
@Exclude()
slug: string;

@ApiProperty()
@Exclude()
stock: number;

@ApiProperty()
@Exclude()
sizes: string[];

@ApiProperty()
@Exclude()
gender: string;

@ApiProperty()
@Exclude()
tags: string[];

@ApiProperty()
images: string[];

@ApiProperty()
@Exclude()
type: string;


}

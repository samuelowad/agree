import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Geometry } from "geojson";
import { Farm } from "modules/farms/entities/farm.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @Column()
  public address: string;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  public coordinates: Geometry;

  @OneToMany(() => Farm, farm => farm.user)
  public farms: Farm;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
